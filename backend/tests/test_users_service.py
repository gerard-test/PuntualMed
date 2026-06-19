import uuid

from app.users.models import Profile
from app.users.schemas import ProfileUpdate
from app.users.service import UserService


class _FakeRepo:
    # Repo en memoria para probar la logica del servicio sin DB
    def __init__(self) -> None:
        self._store: dict[uuid.UUID, Profile] = {}

    async def get(self, user_id: uuid.UUID) -> Profile | None:
        return self._store.get(user_id)

    async def add(self, profile: Profile) -> Profile:
        self._store[profile.id] = profile
        return profile


async def test_get_or_create_creates_when_absent():
    repo = _FakeRepo()
    service = UserService(repo)
    user_id = uuid.uuid4()
    profile = await service.get_or_create(user_id, full_name="Iris")
    assert profile.id == user_id
    assert profile.full_name == "Iris"
    assert await repo.get(user_id) is profile


async def test_get_or_create_returns_existing():
    repo = _FakeRepo()
    user_id = uuid.uuid4()
    existing = Profile(id=user_id, full_name="Original")
    await repo.add(existing)
    service = UserService(repo)
    profile = await service.get_or_create(user_id, full_name="Ignored")
    assert profile is existing
    assert profile.full_name == "Original"


async def test_update_profile_sets_fields():
    repo = _FakeRepo()
    user_id = uuid.uuid4()
    service = UserService(repo)
    updated = await service.update_profile(
        user_id, ProfileUpdate(full_name="Iris", expo_push_token="ExpoToken[abc]")
    )
    assert updated.full_name == "Iris"
    assert updated.expo_push_token == "ExpoToken[abc]"


async def test_update_profile_does_not_clobber_unset_fields():
    # Un campo None en el update no debe pisar un valor existente
    repo = _FakeRepo()
    user_id = uuid.uuid4()
    await repo.add(
        Profile(id=user_id, full_name="Iris", expo_push_token="ExpoToken[abc]")
    )
    service = UserService(repo)
    updated = await service.update_profile(
        user_id, ProfileUpdate(full_name="Iris Evinan")
    )
    assert updated.full_name == "Iris Evinan"
    assert updated.expo_push_token == "ExpoToken[abc]"
