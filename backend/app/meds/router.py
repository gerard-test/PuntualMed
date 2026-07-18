import uuid
from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.router import get_ai_service
from app.ai.service import AiService
from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.meds.repository import MedicationRepository
from app.meds.schemas import (
    MedicationCreate,
    MedicationRead,
    MedicationUpdate,
    PrescriptionMedication,
    ScheduleCreate,
    ScheduleRead,
    ScheduleRecalculate,
)
from app.meds.service import MedicationService
from app.reminders.router import get_intake_service
from app.reminders.service import IntakeService

router = APIRouter(prefix="/medications", tags=["medications"])

_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="medication not found"
)


def get_medication_service(db: AsyncSession = Depends(get_db)) -> MedicationService:
    return MedicationService(MedicationRepository(db))


@router.post("", response_model=MedicationRead, status_code=status.HTTP_201_CREATED)
async def create_medication(
    data: MedicationCreate,
    current: CurrentUser = Depends(get_current_user),
    service: MedicationService = Depends(get_medication_service),
    intake_service: IntakeService = Depends(get_intake_service),
) -> MedicationRead:
    medication = await service.create(current.id, data)
    # Genera las tomas del tratamiento en la misma sesion/transaccion
    await intake_service.generate_for_medication(medication)
    return MedicationRead.model_validate(medication)


@router.post(
    "/from-recipe",
    response_model=list[MedicationRead],
    status_code=status.HTTP_201_CREATED,
)
async def create_medications_from_recipe(
    file: UploadFile = File(...),
    start_date: date | None = None,
    duration_days: int | None = None,
    current: CurrentUser = Depends(get_current_user),
    service: MedicationService = Depends(get_medication_service),
    intake_service: IntakeService = Depends(get_intake_service),
    ai_service: AiService = Depends(get_ai_service),
) -> list[MedicationRead]:
    image_bytes = await file.read()
    extracted = await ai_service.extract_medications_from_image(
        current.id, file.filename or "recipe.png", image_bytes
    )
    if not extracted:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se pudieron extraer medicamentos de la imagen. Intenta con una receta más clara o ingrésalos manualmente.",
        )

    created: list[MedicationRead] = []
    for item in extracted:
        name = str(item.get("name") or "").strip()
        dose = str(item.get("dose") or "").strip()
        if not name or not dose:
            continue

        schedules = item.get("schedules") or []
        if isinstance(schedules, str):
            schedules = [schedules]
        payload = MedicationCreate(
            name=name,
            dose=dose,
            start_date=item.get("start_date") or start_date or date.today(),
            duration_days=int(item.get("duration_days") or duration_days or 7),
            frequency_hours=item.get("frequency_hours"),
            notes=item.get("notes"),
            schedules=[
                ScheduleCreate(time_of_day=schedule)
                for schedule in schedules
                if isinstance(schedule, str) and schedule.strip()
            ],
        )
        medication = await service.create(current.id, payload)
        await intake_service.generate_for_medication(medication)
        created.append(MedicationRead.model_validate(medication))
    return created


@router.get("", response_model=list[MedicationRead])
async def list_medications(
    current: CurrentUser = Depends(get_current_user),
    service: MedicationService = Depends(get_medication_service),
) -> list[MedicationRead]:
    meds = await service.list_for_user(current.id)
    return [MedicationRead.model_validate(m) for m in meds]


@router.get("/{medication_id}", response_model=MedicationRead)
async def get_medication(
    medication_id: uuid.UUID,
    current: CurrentUser = Depends(get_current_user),
    service: MedicationService = Depends(get_medication_service),
) -> MedicationRead:
    medication = await service.get_for_user(current.id, medication_id)
    if medication is None:
        raise _NOT_FOUND
    return MedicationRead.model_validate(medication)


@router.patch("/{medication_id}", response_model=MedicationRead)
async def update_medication(
    medication_id: uuid.UUID,
    data: MedicationUpdate,
    current: CurrentUser = Depends(get_current_user),
    service: MedicationService = Depends(get_medication_service),
) -> MedicationRead:
    medication = await service.update(current.id, medication_id, data)
    if medication is None:
        raise _NOT_FOUND
    return MedicationRead.model_validate(medication)


@router.delete("/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication(
    medication_id: uuid.UUID,
    current: CurrentUser = Depends(get_current_user),
    service: MedicationService = Depends(get_medication_service),
) -> None:
    deleted = await service.delete(current.id, medication_id)
    if not deleted:
        raise _NOT_FOUND


@router.post(
    "/{medication_id}/recalculate", 
    response_model=list[ScheduleRead]
)
async def recalculate_medication_schedules(
    medication_id: uuid.UUID,
    data: ScheduleRecalculate,
    current: CurrentUser = Depends(get_current_user),
    service: MedicationService = Depends(get_medication_service),
    intake_service: IntakeService = Depends(get_intake_service),
) -> list[ScheduleRead]:
    schedules = await service.recalculate_schedules(current.id, medication_id, data.new_start_time)
    if schedules is None:
        raise _NOT_FOUND
    
    # IMPORTANTE: Al cambiar los horarios, también debemos regenerar las tomas futuras
    medication = await service.get_for_user(current.id, medication_id)
    if medication:
        await intake_service.generate_for_medication(medication)
        
    return [ScheduleRead.model_validate(s) for s in schedules]


@router.post(
    "/{medication_id}/schedules",
    response_model=ScheduleRead,
    status_code=status.HTTP_201_CREATED,
)
async def add_schedule(
    medication_id: uuid.UUID,
    data: ScheduleCreate,
    current: CurrentUser = Depends(get_current_user),
    service: MedicationService = Depends(get_medication_service),
) -> ScheduleRead:
    schedule = await service.add_schedule(current.id, medication_id, data)
    if schedule is None:
        raise _NOT_FOUND
    return ScheduleRead.model_validate(schedule)


@router.get("/{medication_id}/schedules", response_model=list[ScheduleRead])
async def list_schedules(
    medication_id: uuid.UUID,
    current: CurrentUser = Depends(get_current_user),
    service: MedicationService = Depends(get_medication_service),
) -> list[ScheduleRead]:
    medication = await service.get_for_user(current.id, medication_id)
    if medication is None:
        raise _NOT_FOUND
    return [ScheduleRead.model_validate(s) for s in medication.schedules]