"""create ai messages

Revision ID: 679966472abd
Revises: 08ec92550124
Create Date: 2026-06-19 23:34:43.543077

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '679966472abd'
down_revision: Union[str, None] = '08ec92550124'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_messages",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("kind", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("content", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["profiles.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    # Cierra PostgREST/anon; el backend (rol postgres, BYPASSRLS) sigue accediendo.
    op.execute("ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("ai_messages")
