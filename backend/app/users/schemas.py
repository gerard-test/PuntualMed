import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProfileRead(BaseModel):
    # Salida del perfil hacia el cliente
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str | None
    expo_push_token: str | None
    created_at: datetime


class ProfileUpdate(BaseModel):
    # Campos editables del perfil (todos opcionales)
    full_name: str | None = None
    expo_push_token: str | None = None
