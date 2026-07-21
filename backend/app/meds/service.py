import uuid
from datetime import timedelta

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
        # end_date derivado de la duracion del tratamiento
        end_date = data.start_date + timedelta(days=data.duration_days)
        medication = Medication(
            id=uuid.uuid4(),
            user_id=user_id,
            name=data.name,
            dose=data.dose,
            frequency_hours=data.frequency_hours,
            start_date=data.start_date,
            duration_days=data.duration_days,
            end_date=end_date,
            notes=data.notes,
            source="manual",
            schedules=[
                MedicationSchedule(id=uuid.uuid4(), time_of_day=s.time_of_day)
                for s in data.schedules
            ],
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
        if data.start_date is not None:
            medication.start_date = data.start_date
        if data.duration_days is not None:
            medication.duration_days = data.duration_days
        if data.start_date is not None or data.duration_days is not None:
            # end_date es derivado; se recalcula si cambio cualquiera de los dos
            medication.end_date = medication.start_date + timedelta(
                days=medication.duration_days
            )
        if data.schedules is not None:
            # Reemplaza los horarios; el cascade="all, delete-orphan" del modelo
            # borra los anteriores. Las tomas ya generadas (reminders) no se
            # tocan aqui: eso lo maneja el router llamando a IntakeService.
            medication.schedules = [
                MedicationSchedule(id=uuid.uuid4(), time_of_day=s.time_of_day)
                for s in data.schedules
            ]
        return await self._repository.add(medication)

    @staticmethod
    def schedule_changed(data: MedicationUpdate) -> bool:
        # True si el update requiere regenerar las tomas pendientes futuras
        return (
            data.start_date is not None
            or data.duration_days is not None
            or data.schedules is not None
        )

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
