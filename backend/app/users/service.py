import uuid

from app.users.models import Profile
from app.users.repository import ProfileRepository
from app.users.schemas import ProfileUpdate


class UserService:
    # Logica de perfiles: auto-provisiona y actualiza
    def __init__(self, repository: ProfileRepository) -> None:
        self._repository = repository

    async def get_or_create(
        self, user_id: uuid.UUID, full_name: str | None = None
    ) -> Profile:
        profile = await self._repository.get(user_id)
        if profile is None:
            profile = await self._repository.add(
                Profile(id=user_id, full_name=full_name)
            )
        return profile

    async def update_profile(
        self, user_id: uuid.UUID, data: ProfileUpdate
    ) -> Profile:
        profile = await self.get_or_create(user_id)
        if data.full_name is not None:
            profile.full_name = data.full_name
        if data.expo_push_token is not None:
            profile.expo_push_token = data.expo_push_token
        await self._repository.add(profile)
        return profile
