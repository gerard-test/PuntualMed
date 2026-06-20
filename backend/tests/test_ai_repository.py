import os
import uuid

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.ai.models import AiMessage
from app.ai.repository import AiMessageRepository
from app.db.base import Base
from app.users.models import Profile

_TEST_DB = os.environ.get("TEST_DATABASE_URL")

pytestmark = pytest.mark.skipif(
    not _TEST_DB, reason="TEST_DATABASE_URL no configurada (test de integracion)"
)


@pytest_asyncio.fixture
async def session():
    engine = create_async_engine(_TEST_DB)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as s:
        yield s
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


async def _seed_profile(session, user_id: uuid.UUID) -> None:
    session.add(Profile(id=user_id, full_name="Iris"))
    await session.flush()


def _message(user_id: uuid.UUID, content: str = "analisis") -> AiMessage:
    return AiMessage(
        id=uuid.uuid4(), user_id=user_id, kind="symptom_analysis",
        role="assistant", content=content,
    )


async def test_add_and_list_filters_by_user(session):
    user_a, user_b = uuid.uuid4(), uuid.uuid4()
    await _seed_profile(session, user_a)
    await _seed_profile(session, user_b)
    repo = AiMessageRepository(session)
    await repo.add(_message(user_a, "de A"))
    await repo.add(_message(user_b, "de B"))
    await session.commit()

    got = await repo.list_by_user(user_a)
    assert len(got) == 1
    assert got[0].content == "de A"
