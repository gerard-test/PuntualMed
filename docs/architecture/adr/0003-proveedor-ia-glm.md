# ADR-0003: GLM (Zhipu) tras una interfaz `AIProvider`

- Estado: Aceptada
- Fecha: 2026-06-15

## Contexto

Dos funciones del producto dependen de IA: leer la foto de una receta (requiere **visión**)
y un agente que analiza síntomas, adherencia y efectos secundarios (**texto**). Se necesita
un proveedor con visión + texto, idealmente de bajo costo o gratuito, sin atar el diseño a
un único proveedor.

## Decisión

Definir una interfaz **`AIProvider`** (inversión de dependencias) con métodos para OCR de
recetas y consultas de texto. La implementación por defecto es **GLM (Zhipu)**:
`GLM-4V-Flash` para visión y `GLM-4-Flash` para texto, ambos en capa gratuita.

## Consecuencias

**Positivas:**
- Costo cero en la capa gratuita de GLM, con visión real para el OCR.
- Cambiar de proveedor (a Claude, Gemini, etc.) es una nueva implementación + cambio de config.
- El disclaimer médico obligatorio se inyecta en el prompt de todos los métodos de salud.

**Negativas:**
- La capa gratuita puede tener límites de tasa o latencia variable.

## Alternativas consideradas

- **DeepSeek:** descartado para visión; su API principal es solo texto (el modelo de visión
  no está expuesto en la API estándar). Sirve para texto, no para el OCR de recetas.
- **Kimi (Moonshot):** tiene visión y contexto largo, pero su capa gratuita son créditos que se agotan.
- **Claude / Gemini:** mayor calidad; quedan como opción de upgrade gracias a la interfaz `AIProvider`.
