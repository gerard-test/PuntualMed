import app.notifications.models  # noqa: F401  (registra las tablas en Base.metadata)
from app.db.base import Base


def test_notifications_tables_registered() -> None:
    tables = set(Base.metadata.tables)
    assert "family_contacts" in tables
    assert "contact_link_tokens" in tables
