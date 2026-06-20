import uuid

from app.ai.models import AiMessage


def test_ai_message_transient_created_at_is_none():
    message = AiMessage(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        kind="symptom_analysis",
        role="assistant",
        content="Texto de analisis",
    )
    assert message.kind == "symptom_analysis"
    assert message.role == "assistant"
    assert message.content == "Texto de analisis"
    # server_default se aplica en el flush, no en construccion
    assert message.created_at is None
