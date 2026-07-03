# ADR-0005: Worker separado con APScheduler para tareas programadas

- Estado: Aceptada
- Fecha: 2026-06-15

## Contexto

El sistema debe disparar recordatorios de toma a una hora programada y, si el usuario no
confirma dentro de un plazo de gracia, marcar la toma como perdida y alertar a un familiar
por Telegram. Esto requiere ejecución periódica e independiente de las peticiones HTTP del
API.

## Decisión

Ejecutar un **worker separado** (proceso aparte del API) con **APScheduler**, que comparte
el código de dominio y la base de datos con el API pero corre como su propia unidad
desplegable.

## Consecuencias

**Positivas:**
- Separa un runtime legítimamente distinto (jobs programados) del API de peticiones.
- No bloquea ni compite con los workers HTTP del API.
- Da una segunda unidad desplegable con justificación técnica real (no por moda).

**Negativas:**
- Un proceso más que desplegar y monitorear.
- Requiere cuidado para no duplicar recordatorios ni alertas.

## Alternativas consideradas

- **Tareas en background dentro del API (BackgroundTasks / un hilo):** descartado; mezcla
  responsabilidades y es frágil con múltiples réplicas del API.
- **Cola de tareas (Celery + Redis):** potente pero excesivo a esta escala; añade un broker
  y más infraestructura sin necesidad actual (YAGNI).
