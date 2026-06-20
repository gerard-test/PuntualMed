from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Punto unico de arranque/cierre de recursos del proceso
    # Placeholder intencional: aqui se conectaran recursos de arranque/cierre cuando hagan falta.
    yield


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
