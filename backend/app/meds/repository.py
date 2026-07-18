import uuid
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.meds.models import Medication

class MedicationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, medication: Medication) -> Medication:
        self._session.add(medication)
        await self._session.flush()
        return medication

    async def list_by_user(self, user_id: uuid.UUID) -> list[Medication]:
        result = await self._session.execute(
            select(Medication)
            .where(Medication.user_id == user_id)
            .order_by(Medication.created_at)
        )
        return list(result.scalars().all())

    async def get_for_user(
        self, medication_id: uuid.UUID, user_id: uuid.UUID
    ) -> Medication | None:
        result = await self._session.execute(
            select(Medication).where(
                Medication.id == medication_id, Medication.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def delete(self, medication: Medication) -> None:
        await self._session.delete(medication)
        await self._session.flush()

    # --- NUEVOS MÉTODOS REQUERIDOS ---

    async def find_active_by_name_and_date(self, user_id: uuid.UUID, name: str, start_date: date) -> Medication | None:
        result = await self._session.execute(
            select(Medication).where(
                Medication.user_id == user_id,
                Medication.name == name,
                Medication.start_date == start_date,
                Medication.active == True
            )
        )
        return result.scalar_one_or_none()

    async def list_active_by_user(self, user_id: uuid.UUID) -> list[Medication]:
        result = await self._session.execute(
            select(Medication).where(
                Medication.user_id == user_id,
                Medication.active == True
            )
        )
        return list(result.scalars().all())