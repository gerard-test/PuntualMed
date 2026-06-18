import inspect

from sqlalchemy.ext.asyncio import AsyncEngine

from app.core import database


def test_get_engine_returns_async_engine():
    # Assert: el engine se construye como asincrono (lazy)
    assert isinstance(database.get_engine(), AsyncEngine)


def test_get_db_is_async_generator():
    # Assert: la dependencia es un generador asincrono
    assert inspect.isasyncgenfunction(database.get_db)
