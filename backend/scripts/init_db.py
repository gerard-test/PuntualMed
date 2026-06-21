import asyncio

# Importa todos los modelos para que Base.metadata los conozca antes de create_all.
import app.ai.models  # noqa: F401
import app.meds.models  # noqa: F401
import app.notifications.models  # noqa: F401
import app.reminders.models  # noqa: F401
import app.symptoms.models  # noqa: F401
import app.users.models  # noqa: F401
from app.core.database import get_engine
from app.db.base import Base


async def _init() -> None:
    engine = get_engine()
    async with engine.begin() as conn:
        # checkfirst=True (por defecto): solo crea las tablas que faltan; no toca las existentes.
        await conn.run_sync(Base.metadata.create_all)
    print("init_db OK: tablas creadas/verificadas.")


if __name__ == "__main__":
    asyncio.run(_init())
