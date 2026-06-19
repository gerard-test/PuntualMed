import uuid
from datetime import date, time

from app.meds.models import Medication, MedicationSchedule
from app.meds.schemas import (
    MedicationCreate,
    MedicationUpdate,
    ScheduleCreate,
)
from app.meds.service import MedicationService


class _FakeRepo:
    # Repo en memoria para probar la logica del servicio sin DB
    def __init__(self) -> None:
        self._store: dict[uuid.UUID, Medication] = {}

    async def add(self, medication: Medication) -> Medication:
        self._store[medication.id] = medication
        return medication

    async def list_by_user(self, user_id: uuid.UUID) -> list[Medication]:
        return [m for m in self._store.values() if m.user_id == user_id]

    async def get_for_user(self, medication_id, user_id):
        med = self._store.get(medication_id)
        if med is None or med.user_id != user_id:
            return None
        return med

    async def delete(self, medication: Medication) -> None:
        self._store.pop(medication.id, None)


def _create_data(**kwargs) -> MedicationCreate:
    base = dict(
        name="Paracetamol",
        dose="500 mg",
        start_date=date(2026, 1, 1),
        duration_days=7,
    )
    base.update(kwargs)
    return MedicationCreate(**base)


async def test_create_derives_end_date_and_persists():
    repo = _FakeRepo()
    service = MedicationService(repo)
    user_id = uuid.uuid4()
    med = await service.create(
        user_id, _create_data(schedules=[ScheduleCreate(time_of_day=time(8, 0))])
    )
    assert med.user_id == user_id
    assert med.end_date == date(2026, 1, 8)  # start + 7 dias
    assert med.source == "manual"
    assert len(med.schedules) == 1


async def test_list_for_user_returns_only_owned():
    repo = _FakeRepo()
    service = MedicationService(repo)
    owner = uuid.uuid4()
    other = uuid.uuid4()
    await service.create(owner, _create_data(name="A"))
    await service.create(other, _create_data(name="B"))
    meds = await service.list_for_user(owner)
    assert [m.name for m in meds] == ["A"]


async def test_get_for_user_returns_none_for_other_owner():
    repo = _FakeRepo()
    service = MedicationService(repo)
    owner = uuid.uuid4()
    med = await service.create(owner, _create_data())
    assert await service.get_for_user(owner, med.id) is med
    assert await service.get_for_user(uuid.uuid4(), med.id) is None


async def test_update_guards_none_and_ownership():
    repo = _FakeRepo()
    service = MedicationService(repo)
    owner = uuid.uuid4()
    med = await service.create(owner, _create_data(name="A", dose="500 mg"))
    updated = await service.update(owner, med.id, MedicationUpdate(name="B"))
    assert updated is not None
    assert updated.name == "B"
    assert updated.dose == "500 mg"  # None no pisa
    assert await service.update(uuid.uuid4(), med.id, MedicationUpdate(name="X")) is None


async def test_delete_returns_false_when_absent_or_not_owned():
    repo = _FakeRepo()
    service = MedicationService(repo)
    owner = uuid.uuid4()
    med = await service.create(owner, _create_data())
    assert await service.delete(uuid.uuid4(), med.id) is False
    assert await service.delete(owner, med.id) is True
    assert await service.list_for_user(owner) == []


async def test_add_schedule_respects_ownership():
    repo = _FakeRepo()
    service = MedicationService(repo)
    owner = uuid.uuid4()
    med = await service.create(owner, _create_data())
    schedule = await service.add_schedule(
        owner, med.id, ScheduleCreate(time_of_day=time(20, 0))
    )
    assert isinstance(schedule, MedicationSchedule)
    assert schedule.time_of_day == time(20, 0)
    assert await service.add_schedule(
        uuid.uuid4(), med.id, ScheduleCreate(time_of_day=time(20, 0))
    ) is None
