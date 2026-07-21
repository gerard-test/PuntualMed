import uuid
from datetime import date, datetime, time

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Time,
    Uuid,
    func,
    ARRAY,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("profiles.id"))
    name: Mapped[str] = mapped_column(String)
    dose: Mapped[str] = mapped_column(String)
    frequency_hours: Mapped[int | None] = mapped_column(Integer)
    start_date: Mapped[date] = mapped_column(Date)
    duration_days: Mapped[int] = mapped_column(Integer)
    end_date: Mapped[date] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(String)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    source: Mapped[str] = mapped_column(String, default="manual")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    schedules: Mapped[list["MedicationSchedule"]] = relationship(
        back_populates="medication",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class MedicationSchedule(Base):
    __tablename__ = "medication_schedules"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    medication_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("medications.id", ondelete="CASCADE")
    )
    time_of_day: Mapped[time] = mapped_column(Time)
    medication: Mapped["Medication"] = relationship(back_populates="schedules")