import uuid
from datetime import UTC, datetime

from app.symptoms.models import Symptom


def test_symptom_optional_fields_default_none_on_transient():
    symptom = Symptom(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        description="Dolor de cabeza",
        occurred_at=datetime(2026, 6, 19, 13, 0, tzinfo=UTC),
    )
    assert symptom.medication_id is None
    assert symptom.severity is None
    assert symptom.description == "Dolor de cabeza"
