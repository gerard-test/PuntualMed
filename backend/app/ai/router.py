from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.provider import AIProvider, GLMProvider
from app.ai.repository import AiMessageRepository
from app.ai.schemas import AiMessageRead
from app.ai.service import AiService
from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.meds.repository import MedicationRepository
from app.symptoms.repository import SymptomRepository

router = APIRouter(prefix="/ai", tags=["ai"])


def get_ai_provider() -> AIProvider:
    return GLMProvider(get_settings().zhipu_api_key)


def get_ai_service(
    db: AsyncSession = Depends(get_db),
    provider: AIProvider = Depends(get_ai_provider),
) -> AiService:
    return AiService(
        provider,
        AiMessageRepository(db),
        SymptomRepository(db),
        MedicationRepository(db),
    )


@router.post("/symptoms/analyze", response_model=AiMessageRead)
async def analyze_symptoms(
    current: CurrentUser = Depends(get_current_user),
    service: AiService = Depends(get_ai_service),
) -> AiMessageRead:
    message = await service.analyze_symptoms(current.id)
    return AiMessageRead.model_validate(message)
