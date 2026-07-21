import uuid
from datetime import datetime
from enum import StrEnum
from pydantic import BaseModel, ConfigDict

# Importamos MedicationRead para embeber la información de la medicina
from app.meds.schemas import MedicationRead 

class IntakeStatus(StrEnum):
    PENDING = "pending"
    TAKEN = "taken"
    MISSED = "missed"

class IntakeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    medication_id: uuid.UUID
    scheduled_at: datetime
    status: str
    confirmed_at: datetime | None
    photo_url: str | None
    medication: MedicationRead 

class IntakeConfirm(BaseModel):
    photo_url: str | None = None