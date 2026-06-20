from typing import Protocol

import httpx

# Disclaimer medico obligatorio en toda respuesta de texto de salud.
DISCLAIMER = (
    "Esto no reemplaza una consulta medica; acude a un profesional de la salud."
)

_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
_MODEL = "glm-4-flash"


class AIProvider(Protocol):
    # Analiza sintomas; devuelve texto con disclaimer (solo texto).
    async def analyze_symptoms(
        self, symptoms: list[dict], meds: list[dict]
    ) -> str: ...


class GLMProvider:
    # Implementacion real con GLM-4-Flash (texto) de Zhipu.
    # Escrita pero no probada contra la API real; los tests usan httpx.MockTransport.
    def __init__(
        self, api_key: str | None, *, transport: httpx.AsyncBaseTransport | None = None
    ) -> None:
        self._api_key = api_key
        self._transport = transport

    async def analyze_symptoms(self, symptoms: list[dict], meds: list[dict]) -> str:
        if not self._api_key:
            raise RuntimeError("ZHIPU_API_KEY no configurada")
        system = (
            "Eres un asistente de salud. NUNCA diagnostiques de forma afirmativa. "
            "Sugiere posibles causas en lenguaje prudente. "
            f"Incluye SIEMPRE este disclaimer al final: {DISCLAIMER}"
        )
        user = (
            f"Sintomas registrados: {symptoms}\n"
            f"Medicamentos actuales: {meds}\n"
            "Analiza posibles causas y cuando acudir al medico."
        )
        payload = {
            "model": _MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
        async with httpx.AsyncClient(transport=self._transport, timeout=30.0) as client:
            response = await client.post(
                _ENDPOINT,
                headers={"Authorization": f"Bearer {self._api_key}"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
