import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.models import AiMessage


class AiMessageRepository:
    # Acceso a datos de ai_messages. Una instancia por request.
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, message: AiMessage) -> AiMessage:
        self._session.add(message)
        await self._session.flush()
        return message

    async def list_by_user(self, user_id: uuid.UUID) -> list[AiMessage]:
        result = await self._session.execute(
            select(AiMessage)
            .where(AiMessage.user_id == user_id)
            .order_by(AiMessage.created_at.desc())
        )
        return list(result.scalars().all())
