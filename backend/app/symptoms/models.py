import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Symptom(Base):
    # Sintoma inusual del usuario; puede o no estar ligado a un medicamento.
    # Si el medicamento se borra, el sintoma persiste con medication_id en NULL.
    __tablename__ = "symptoms"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("profiles.id"))
    medication_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("medications.id", ondelete="SET NULL")
    )
    description: Mapped[str] = mapped_column(String)
    severity: Mapped[str | None] = mapped_column(String)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
