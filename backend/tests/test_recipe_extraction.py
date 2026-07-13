import uuid
from datetime import UTC, date, datetime

from app.core.security import CurrentUser, get_current_user
from app.meds.models import Medication
from app.meds import router as meds_router
from app.meds.router import get_medication_service
from app.meds.service import MedicationService
from app.reminders.router import get_intake_service
from app.reminders.service import IntakeService

_USER_ID = uuid.uuid4()


class _FakeIntakeRepo:
    def __init__(self) -> None:
        self.store = {}

    async def add(self, intake):
        self.store[intake.id] = intake
        return intake

    async def add_many(self, intakes):
        for intake in intakes:
            self.store[intake.id] = intake
        return intakes

    async def get_for_user(self, intake_id, user_id):
        intake = self.store.get(intake_id)
        return intake if intake and intake.user_id == user_id else None

    async def list_for_user(self, user_id, lower, upper, status):
        return [i for i in self.store.values() if i.user_id == user_id]


class _FakeMedicationRepo:
    def __init__(self) -> None:
        self._store: dict[uuid.UUID, Medication] = {}

    async def add(self, medication):
        if medication.created_at is None:
            medication.created_at = datetime(2026, 1, 1, tzinfo=UTC)
        if medication.active is None:
            medication.active = True
        self._store[medication.id] = medication
        return medication

    async def list_by_user(self, user_id):
        return [m for m in self._store.values() if m.user_id == user_id]

    async def get_for_user(self, medication_id, user_id):
        med = self._store.get(medication_id)
        return med if med and med.user_id == user_id else None

    async def delete(self, medication):
        self._store.pop(medication.id, None)


class _FakeAIService:
    async def extract_medications_from_image(self, user_id, filename, image_bytes):
        return [
            {
                "name": "Amoxicilina",
                "dose": "500 mg",
                "start_date": "2026-01-01",
                "duration_days": 7,
                "frequency_hours": 24,
                "schedules": ["09:00"],
                "notes": "Extraído de la receta",
            }
        ]


class _EmptyAIService:
    async def extract_medications_from_image(self, user_id, filename, image_bytes):
        return []


def _override_auth():
    return CurrentUser(id=_USER_ID, email="iris@example.com")


def _wire(app, repo):
    app.dependency_overrides[get_current_user] = _override_auth
    app.dependency_overrides[get_medication_service] = lambda: MedicationService(repo)
    app.dependency_overrides[get_intake_service] = lambda: IntakeService(_FakeIntakeRepo())


async def test_create_medications_from_recipe_upload_returns_201(app, client):
    repo = _FakeMedicationRepo()
    _wire(app, repo)
    app.dependency_overrides[get_intake_service] = lambda: IntakeService(_FakeIntakeRepo())
    app.dependency_overrides[meds_router.get_ai_service] = lambda: _FakeAIService()
    try:
        response = await client.post(
            "/api/v1/medications/from-recipe",
            params={"start_date": "2026-01-01", "duration_days": 7},
            files={"file": ("receta.png", b"fake-image-bytes", "image/png")},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Amoxicilina"
    assert body[0]["dose"] == "500 mg"
    assert body[0]["start_date"] == "2026-01-01"
    assert body[0]["duration_days"] == 7
    assert body[0]["frequency_hours"] == 24
    assert body[0]["schedules"][0]["time_of_day"] == "09:00:00"


async def test_create_medications_from_recipe_upload_returns_422_when_empty(app, client):
    repo = _FakeMedicationRepo()
    _wire(app, repo)
    app.dependency_overrides[get_intake_service] = lambda: IntakeService(_FakeIntakeRepo())
    app.dependency_overrides[meds_router.get_ai_service] = lambda: _EmptyAIService()
    try:
        response = await client.post(
            "/api/v1/medications/from-recipe",
            params={"start_date": "2026-01-01", "duration_days": 7},
            files={"file": ("receta.png", b"fake-image-bytes", "image/png")},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422
    assert "No se pudieron extraer medicamentos" in response.json()["detail"]
