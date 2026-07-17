import base64
import json
import re
from typing import Protocol

import httpx

# Disclaimer medico obligatorio en toda respuesta de texto de salud.
DISCLAIMER = (
    "Esto no reemplaza una consulta medica; acude a un profesional de la salud."
)

# Llamada a gemini 2.5 flash
_GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


class AIProvider(Protocol):
    async def analyze_symptoms(
        self, symptoms: list[dict], meds: list[dict]
    ) -> str: ...

    async def extract_medications_from_image(
        self, filename: str, image_bytes: bytes
    ) -> list[dict]: ...


class GeminiProvider:
    def __init__(
        self, api_key: str | None, *, transport: httpx.AsyncBaseTransport | None = None
    ) -> None:
        self._api_key = api_key
        self._transport = transport

    async def analyze_symptoms(self, symptoms: list[dict], meds: list[dict]) -> str:
        if not self._api_key:
            raise RuntimeError("GEMINI_API_KEY no configurada")

        prompt = (
            "Eres un asistente de salud. NUNCA diagnostiques de forma afirmativa. "
            "Sugiere posibles causas en lenguaje prudente e indica cuando acudir al medico.\n"
            f"Sintomas registrados: {symptoms}\n"
            f"Medicamentos actuales: {meds}\n"
            "Analiza posibles causas y cuando acudir al medico."
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2},
        }
        async with httpx.AsyncClient(transport=self._transport, timeout=30.0) as client:
            # Usamos el modelo principal que sabemos que funciona
            response = await client.post(
                f"{_GEMINI_ENDPOINT}?key={self._api_key}",
                json=payload,
            )
            if response.status_code != 200:
                print(f"\n❌ DETALLE DE GEMINI: {response.text}\n")

            response.raise_for_status()
            data = response.json()
            try:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError, TypeError) as exc:
                raise RuntimeError(f"Respuesta inesperada de Gemini: {data}") from exc

    async def extract_medications_from_image(
        self, filename: str, image_bytes: bytes
    ) -> list[dict]:
        if not self._api_key:
            raise RuntimeError("GEMINI_API_KEY no configurada")

        mime_type = self._infer_mime_type(filename)
        prompt = (
            "Analiza esta receta médica y extrae los medicamentos en un array JSON. "
            "Para cada medicamento, usa este esquema exacto: "
            "{"
            "'name': string, 'dose': string (cantidad + unidad, ej: '500 mg'), "
            "'start_date': 'YYYY-MM-DD', 'duration_days': integer, "
            "'frequency_hours': integer o null, "
            "'schedules': array de objetos {'time_of_day': 'HH:MM:SS'}, 'notes': string"
            "}. "
            "REGLAS: "
            "1. 'start_date' debe ser formato ISO (YYYY-MM-DD). Usa la fecha actual si no hay fecha. "
            "2. 'duration_days' y 'frequency_hours' deben ser números. REGLA ESTRICTA: Si la receta NO indica explícitamente cada cuántas horas se debe tomar el medicamento, 'frequency_hours' DEBE ser estrictamente null. NUNCA inventes o asumas una frecuencia por defecto. "
            "3. Si 'schedules' no se puede inferir, usa una lista vacía []. "
            "4. Devuelve SOLO el array JSON, sin formato markdown, sin prefijos, sin explicaciones. "
        )
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": base64.b64encode(image_bytes).decode("ascii"),
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json",
            },
        }
        async with httpx.AsyncClient(transport=self._transport, timeout=30.0) as client:
            # Usamos el modelo principal que sabemos que funciona
            response = await client.post(
                f"{_GEMINI_ENDPOINT}?key={self._api_key}",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            try:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError, TypeError) as exc:
                raise RuntimeError(f"Respuesta inesperada de Gemini: {data}") from exc

        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\[(.*)\]", text, re.S)
            if match is None:
                return []
            try:
                parsed = json.loads(match.group(0))
            except json.JSONDecodeError:
                return []

        if isinstance(parsed, dict):
            extracted = self._extract_medication_items(parsed)
            if extracted is not None:
                return extracted
            return [parsed]
        if isinstance(parsed, list):
            return [item for item in parsed if isinstance(item, dict)]
        return []

    @staticmethod
    def _extract_medication_items(payload: dict) -> list[dict] | None:
        for key in ("medications", "items", "prescriptions", "results", "data"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
            if isinstance(value, dict):
                return [value]

        if all(key in payload for key in ("name", "dose")):
            return [payload]

        return None

    @staticmethod
    def _infer_mime_type(filename: str) -> str:
        lower = filename.lower()
        if lower.endswith(".png"):
            return "image/png"
        if lower.endswith(".jpg") or lower.endswith(".jpeg"):
            return "image/jpeg"
        if lower.endswith(".webp"):
            return "image/webp"
        return "image/png"