from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.meds.repository import MedicationRepository
from app.symptoms.repository import SymptomRepository
from app.symptoms.schemas import SymptomCreate, SymptomRead
from app.symptoms.service import SymptomService

router = APIRouter(prefix="/symptoms", tags=["symptoms"])

_MED_NOT_FOUND = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="medication not found"
)


def get_symptom_service(db: AsyncSession = Depends(get_db)) -> SymptomService:
    return SymptomService(SymptomRepository(db), MedicationRepository(db))


@router.post("", response_model=SymptomRead, status_code=status.HTTP_201_CREATED)
async def create_symptom(
    data: SymptomCreate,
    current: CurrentUser = Depends(get_current_user),
    service: SymptomService = Depends(get_symptom_service),
) -> SymptomRead:
    symptom = await service.create(current.id, data)
    if symptom is None:
        raise _MED_NOT_FOUND
    return SymptomRead.model_validate(symptom)


@router.get("", response_model=list[SymptomRead])
async def list_symptoms(
    current: CurrentUser = Depends(get_current_user),
    service: SymptomService = Depends(get_symptom_service),
) -> list[SymptomRead]:
    symptoms = await service.list_for_user(current.id)
    return [SymptomRead.model_validate(s) for s in symptoms]
