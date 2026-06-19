"""create medications

Revision ID: cb03ecb253f6
Revises: 250dbac3aa14
Create Date: 2026-06-18 23:15:03.885274

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'cb03ecb253f6'
down_revision: Union[str, None] = '250dbac3aa14'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "medications",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("dose", sa.String(), nullable=False),
        sa.Column("frequency_hours", sa.Integer(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("source", sa.String(), nullable=False, server_default="manual"),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["profiles.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "medication_schedules",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("medication_id", sa.Uuid(), nullable=False),
        sa.Column("time_of_day", sa.Time(), nullable=False),
        sa.ForeignKeyConstraint(
            ["medication_id"], ["medications.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("medication_schedules")
    op.drop_table("medications")
