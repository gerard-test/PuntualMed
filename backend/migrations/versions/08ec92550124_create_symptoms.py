"""create symptoms

Revision ID: 08ec92550124
Revises: 7e05baeb1b73
Create Date: 2026-06-19 22:45:09.838567

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '08ec92550124'
down_revision: Union[str, None] = '7e05baeb1b73'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "symptoms",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("medication_id", sa.Uuid(), nullable=True),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("severity", sa.String(), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["profiles.id"]),
        sa.ForeignKeyConstraint(["medication_id"], ["medications.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    # Cierra PostgREST/anon; el backend (rol postgres, BYPASSRLS) sigue accediendo.
    op.execute("ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("symptoms")
