import uuid
from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

from app.core.config import get_settings
from app.meds.models import Medication
from app.reminders.models import IntakeLog
from app.reminders.repository import IntakeRepository


class IntakeService:
    # Logica de tomas; la autorizacion se aplica filtrando por user_id
    def __init__(self, repository: IntakeRepository) -> None:
        self._repository = repository

    async def generate_for_medication(self, med: Medication) -> list[IntakeLog]:
        # Una toma por cada dia del tratamiento [start_date, start_date+duration_days)
        # x cada horario, programada en la zona horaria configurada.
        tz = ZoneInfo(get_settings().app_timezone)
        intakes: list[IntakeLog] = []
        for offset in range(med.duration_days):
            day = med.start_date + timedelta(days=offset)
            for schedule in med.schedules:
                scheduled_at = datetime.combine(day, schedule.time_of_day, tzinfo=tz)
                intakes.append(
                    IntakeLog(
                        id=uuid.uuid4(),
                        user_id=med.user_id,
                        medication_id=med.id,
                        scheduled_at=scheduled_at,
                        status="pending",
                    )
                )
        return await self._repository.add_many(intakes)

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        from_date: date | None,
        to_date: date | None,
        status: str | None,
    ) -> list[IntakeLog]:
        tz = ZoneInfo(get_settings().app_timezone)
        lower = (
            datetime.combine(from_date, datetime.min.time(), tzinfo=tz)
            if from_date
            else None
        )
        # to_date inclusivo: el limite superior es el inicio del dia siguiente
        upper = (
            datetime.combine(to_date + timedelta(days=1), datetime.min.time(), tzinfo=tz)
            if to_date
            else None
        )
        return await self._repository.list_for_user(user_id, lower, upper, status)

    async def confirm(
        self, user_id: uuid.UUID, intake_id: uuid.UUID, photo_url: str | None
    ) -> IntakeLog | None:
        intake = await self._repository.get_for_user(intake_id, user_id)
        if intake is None:
            return None
        intake.status = "taken"
        intake.confirmed_at = datetime.now(UTC)
        intake.photo_url = photo_url
        return await self._repository.add(intake)
