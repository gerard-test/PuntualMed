# ADR-0001: Monolito modular en lugar de microservicios

- Estado: Aceptada
- Fecha: 2026-06-15

## Contexto

PuntualMed está proyectada para un público potencialmente grande, lo que sugiere pensar en
escalabilidad. El equipo de desarrollo son dos personas. Existe la tentación de usar
microservicios para "verse profesional".

## Decisión

Construir un **monolito modular**: una sola aplicación (FastAPI) dividida en módulos de
dominio con responsabilidades claras y aisladas (`users`, `meds`, `reminders`, `symptoms`,
`ai`, `notifications`, `calendar`), cada uno con su interfaz. Se separa únicamente un
**worker** de tareas programadas (ver ADR-0005).

## Consecuencias

**Positivas:**
- Sin la complejidad de sistemas distribuidos (red, consistencia eventual, tracing, múltiples despliegues).
- Un solo despliegue, depuración local simple, transacciones de base de datos directas.
- "Microservices-ready": las fronteras de módulos ya están marcadas; extraer un servicio después es viable.

**Negativas:**
- Escalado por ahora es vertical o por réplicas del monolito completo, no por servicio.

## Alternativas consideradas

- **Microservicios:** descartado. Los microservicios resuelven un problema organizacional
  (muchos equipos desplegando independientemente, Ley de Conway), no técnico. Con un equipo
  de dos personas se paga todo el costo sin ningún beneficio. Casos como Amazon Prime Video
  (que volvió a monolito) y Shopify (monolito modular) respaldan esta elección a esta escala.
