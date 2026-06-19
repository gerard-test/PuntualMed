from app.meds.models import Medication, MedicationSchedule


def test_medication_tablename():
    assert Medication.__tablename__ == "medications"


def test_medication_columns():
    cols = set(Medication.__table__.columns.keys())
    assert cols == {
        "id", "user_id", "name", "dose", "frequency_hours", "start_date",
        "duration_days", "end_date", "notes", "source", "active", "created_at",
    }


def test_medication_user_fk_targets_profiles():
    fk = next(iter(Medication.__table__.c.user_id.foreign_keys))
    assert fk.column.table.name == "profiles"


def test_schedule_tablename_and_columns():
    assert MedicationSchedule.__tablename__ == "medication_schedules"
    cols = set(MedicationSchedule.__table__.columns.keys())
    assert cols == {"id", "medication_id", "time_of_day"}


def test_schedule_fk_targets_medications():
    fk = next(iter(MedicationSchedule.__table__.c.medication_id.foreign_keys))
    assert fk.column.table.name == "medications"
