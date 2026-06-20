import httpx
import pytest

from app.ai.provider import GLMProvider


async def test_glm_provider_without_key_raises():
    provider = GLMProvider(api_key=None)
    with pytest.raises(RuntimeError):
        await provider.analyze_symptoms([], [])


async def test_glm_provider_sends_model_and_parses_response():
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["auth"] = request.headers.get("Authorization")
        captured["body"] = request.content.decode()
        return httpx.Response(
            200,
            json={"choices": [{"message": {"content": "Posible causa: deshidratacion."}}]},
        )

    provider = GLMProvider(api_key="test-key", transport=httpx.MockTransport(handler))
    result = await provider.analyze_symptoms(
        [{"description": "mareo", "severity": "leve"}],
        [{"name": "Ibuprofeno", "dose": "400 mg"}],
    )

    assert result == "Posible causa: deshidratacion."
    assert captured["auth"] == "Bearer test-key"
    # el tono prudente lo fija el prompt; el disclaimer lo anade el service, no el LLM
    assert "NUNCA diagnostiques" in captured["body"]
    assert "glm-4.5-flash" in captured["body"]


async def test_glm_provider_malformed_response_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"choices": []})

    provider = GLMProvider(api_key="test-key", transport=httpx.MockTransport(handler))
    with pytest.raises(RuntimeError):
        await provider.analyze_symptoms([], [])
