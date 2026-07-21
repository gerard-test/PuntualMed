import logging
from datetime import datetime, timedelta

from app.reminders.repository import IntakeRepository

logger = logging.getLogger(__name__)

async def notify_pending_intakes(repo: IntakeRepository, now: datetime) -> int:
    # 1. Busca tomas que deben tomarse AHORA y no han sido notificadas
    due_intakes = await repo.list_pending_due_now(now)
    
    count = 0
    for intake in due_intakes:
        # TODO (Frontend / Firebase): Aquí se enviará la Push Notification al celular.
        # Ejemplo: await push_service.send(user.fcm_token, title="Hora de tu medicina", ...)
        logger.info(f"🔔 [PUSH SIMULADO] Es hora de tomar {intake.medication.name} (Usuario: {intake.user_id})")
        
        # 2. Marca la toma para no volver a enviarle la alerta en el siguiente minuto
        await repo.mark_user_notified(intake)
        count += 1
        
    return count

async def mark_missed_intakes(
    repo: IntakeRepository, now: datetime, grace_minutes: int
) -> int:
    # Devuelve cuantas tomas quedaron marcadas como vencidas (para el familiar).
    cutoff = now - timedelta(minutes=grace_minutes)
    return await repo.mark_missed_before(cutoff)