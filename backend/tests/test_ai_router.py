import uuid
from datetime import UTC, datetime

from app.ai.models import AiMessage
from app.ai.provider import DISCLAIMER
from app.ai.router import get_ai_service
from app.ai.service import AiService
from app.core.security import CurrentUser, get_current_user

_USER_ID = uuid.uuid4()


class _FakeAiRepo:
    def __init__(self) -> None:
        self.store: dict[uuid.UUID, AiMessage] = {}

    async def add(self, message):
        # Simula el server_default de created_at al persistir
        if message.created_at is None:
            message.created_at = datetime.now(UTC)
        self.store[message.id] = message
        return message


class _FakeSymptomRepo:
    async def list_by_user(self, user_id):
        return []


class _FakeMedRepo:
    async def list_by_user(self, user_id):
        return []


class _FakeProvider:
    def __init__(self, response: str) -> None:
        self.response = response

    async def analyze_symptoms(self, symptoms, meds):
        return self.response


def _wire(app, ai_repo, provider):
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(
        id=_USER_ID, email="iris@example.com"
    )
    app.dependency_overrides[get_ai_service] = lambda: AiService(
        provider, ai_repo, _FakeSymptomRepo(), _FakeMedRepo()
    )


async def test_analyze_endpoint_returns_200_with_disclaimer(app, client):
    ai_repo = _FakeAiRepo()
    provider = _FakeProvider("Analisis sin aviso")  # sin disclaimer
    _wire(app, ai_repo, provider)
    try:
        response = await client.post("/api/v1/ai/symptoms/analyze")
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 200
    body = response.json()
    assert body["kind"] == "symptom_analysis"
    assert body["role"] == "assistant"
    assert DISCLAIMER in body["content"]
    assert len(ai_repo.store) == 1


async def test_analyze_without_token_returns_401(app, client):
    response = await client.post("/api/v1/ai/symptoms/analyze")
    assert response.status_code == 401
