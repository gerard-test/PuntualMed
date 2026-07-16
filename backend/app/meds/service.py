import uuid
from datetime import timedelta, time

from app.meds.models import Medication, MedicationSchedule
from app.meds.repository import MedicationRepository
from app.meds.schemas import MedicationCreate, MedicationUpdate, ScheduleCreate


class MedicationService:
    # Logica de medicamentos; la autorizacion se aplica filtrando por user_id
    def __init__(self, repository: MedicationRepository) -> None:
        self._repository = repository

    async def create(
        self, user_id: uuid.UUID, data: MedicationCreate
    ) -> Medication:
        # 1. Determinar si la información es completa (si tiene frecuencia)
        # Esto sirve de interruptor para la lógica de seguridad
        is_manual_or_complete = data.frequency_hours is not None

        # 2. Manejo de notas: solo añade advertencia si NO hay frecuencia clara
        notes = data.notes or ""
        if not is_manual_or_complete:
            notes = (
                f"⚠️ NOTA: Horario inferido por IA. Por favor, valide la pauta de tratamiento con su médico. "
                f"{notes}"
            )

        # 3. Lógica de horarios
        if data.schedules and len(data.schedules) > 0:
            schedules_to_add = [
                MedicationSchedule(id=uuid.uuid4(), time_of_day=s.time_of_day)
                for s in data.schedules
            ]
        else:
            # Fallback seguro a las 08:00 AM para evitar arrays vacíos
            schedules_to_add = [
                MedicationSchedule(id=uuid.uuid4(), time_of_day=time(8, 0, 0))
            ]

        # 4. Asignación de frecuencia default (24h) solo si es necesaria
        frequency = data.frequency_hours if is_manual_or_complete else 24

        # 5. end_date derivado de la duracion del tratamiento
        end_date = data.start_date + timedelta(days=data.duration_days)
        
        medication = Medication(
            id=uuid.uuid4(),
            user_id=user_id,
            name=data.name,
            dose=data.dose,
            frequency_hours=frequency,
            start_date=data.start_date,
            duration_days=data.duration_days,
            end_date=end_date,
            notes=notes,
            source="manual" if is_manual_or_complete else "ai_inferred",
            schedules=schedules_to_add,
        )
        return await self._repository.add(medication)

    async def list_for_user(self, user_id: uuid.UUID) -> list[Medication]:
        return await self._repository.list_by_user(user_id)

    async def get_for_user(
        self, user_id: uuid.UUID, medication_id: uuid.UUID
    ) -> Medication | None:
        return await self._repository.get_for_user(medication_id, user_id)

    async def update(
        self, user_id: uuid.UUID, medication_id: uuid.UUID, data: MedicationUpdate
    ) -> Medication | None:
        medication = await self._repository.get_for_user(medication_id, user_id)
        if medication is None:
            return None
        if data.name is not None:
            medication.name = data.name
        if data.dose is not None:
            medication.dose = data.dose
        if data.frequency_hours is not None:
            medication.frequency_hours = data.frequency_hours
        if data.notes is not None:
            medication.notes = data.notes
        if data.active is not None:
            medication.active = data.active
        return await self._repository.add(medication)

    async def delete(
        self, user_id: uuid.UUID, medication_id: uuid.UUID
    ) -> bool:
        medication = await self._repository.get_for_user(medication_id, user_id)
        if medication is None:
            return False
        await self._repository.delete(medication)
        return True

    async def add_schedule(
        self, user_id: uuid.UUID, medication_id: uuid.UUID, data: ScheduleCreate
    ) -> MedicationSchedule | None:
        medication = await self._repository.get_for_user(medication_id, user_id)
        if medication is None:
            return None
        schedule = MedicationSchedule(
            id=uuid.uuid4(),
            medication_id=medication.id,
            time_of_day=data.time_of_day,
        )
        medication.schedules.append(schedule)
        await self._repository.add(medication)
        return schedule