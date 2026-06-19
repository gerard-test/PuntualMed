from fastapi import APIRouter

from app.api import health
from app.users.router import router as users_router

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(users_router)
