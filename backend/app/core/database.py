from collections.abc import AsyncGenerator
from functools import lru_cache

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings


@lru_cache
def get_engine() -> AsyncEngine:
    # El engine se crea de forma diferida (no al importar el modulo).
    # pool_pre_ping evita conexiones muertas.
    settings = get_settings()
    return create_async_engine(settings.database_url, echo=False, pool_pre_ping=True)


@lru_cache
def get_session_factory() -> async_sessionmaker[AsyncSession]:
    # expire_on_commit=False evita lazy-loads accidentales tras commit
    return async_sessionmaker(get_engine(), expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    # Una sesion por request: commit si todo va bien, rollback ante error
    async with get_session_factory()() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
