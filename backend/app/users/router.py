from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.users.repository import ProfileRepository
from app.users.schemas import ProfileRead, ProfileUpdate
from app.users.service import UserService

router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    # Arma el servicio con su repositorio sobre la sesion del request
    return UserService(ProfileRepository(db))


@router.get("/me", response_model=ProfileRead)
async def read_me(
    current: CurrentUser = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> ProfileRead:
    # Auto-provisiona el perfil en la primera llamada autenticada
    profile = await service.get_or_create(current.id)
    return ProfileRead.model_validate(profile)


@router.patch("/me", response_model=ProfileRead)
async def update_me(
    data: ProfileUpdate,
    current: CurrentUser = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> ProfileRead:
    profile = await service.update_profile(current.id, data)
    return ProfileRead.model_validate(profile)
