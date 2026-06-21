from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import get_session_factory
from app.reminders.repository import IntakeRepository
from app.reminders.worker import mark_missed_intakes


async def run_missed_job() -> None:
    # Job del scheduler: marca las tomas vencidas y persiste el cambio.
    settings = get_settings()
    session_factory = get_session_factory()
    async with session_factory() as session:
        repo = IntakeRepository(session)
        await mark_missed_intakes(repo, datetime.now(UTC), settings.missed_grace_minutes)
        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Punto unico de arranque/cierre de recursos del proceso
    settings = get_settings()
    scheduler: AsyncIOScheduler | None = None
    if settings.worker_enabled:
        scheduler = AsyncIOScheduler()
        scheduler.add_job(
            run_missed_job, "interval", minutes=settings.missed_scan_interval_minutes
        )
        scheduler.start()
    try:
        yield
    finally:
        if scheduler is not None:
            scheduler.shutdown(wait=False)


def create_app() -> FastAPI:
    # Factory: permite instanciar la app con config aislada en tests
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        lifespan=lifespan,
    )
    # CORS para clientes navegador (la app web de Expo). Bearer token, sin cookies,
    # por eso allow_credentials=False (compatible con allow_origins=["*"]).
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
