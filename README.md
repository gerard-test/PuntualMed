# PuntualMed

Aplicación móvil para la gestión y adherencia a tratamientos de medicación.
Ayuda al paciente a tomar sus medicamentos a tiempo y permite que un familiar
haga seguimiento remoto de su cumplimiento.

Proyecto final de la asignatura de Dispositivos Móviles.

## El problema

Las personas con tratamientos crónicos o múltiples medicamentos olvidan tomas,
confunden dosis y horarios, y sus familiares no tienen forma de saber si el
tratamiento se está cumpliendo. PuntualMed centraliza los medicamentos, recuerda
cada toma, registra la adherencia y avisa al familiar cuando algo se sale de lo
previsto.

## Funcionalidades del MVP

- Alta de medicamentos y horarios (manual)
- Recordatorios de toma (notificaciones push)
- Confirmación de toma con foto
- Calendario de adherencia
- Alerta al familiar de seguimiento (Telegram)

Versiones futuras: lectura de receta por foto (OCR con IA) y agente de IA para
consultar síntomas y posibles efectos secundarios.

> Aviso: el agente de IA nunca emite un diagnóstico. Siempre recomienda acudir a
> un profesional de la salud.

## Stack

| Capa | Tecnología |
|------|-----------|
| Móvil | React Native + Expo (TypeScript) |
| Backend | Python + FastAPI (monolito modular) + Worker (APScheduler) |
| Base de datos | PostgreSQL (Supabase) |
| Almacenamiento | Supabase Storage (compatible con S3) |
| Autenticación | Supabase Auth (login con Google) |
| IA | Zhipu GLM (visión + texto) tras una interfaz AIProvider |
| Notificaciones | Expo Push (recordatorios) y Telegram (familiar) |
| Despliegue | Render (imágenes Docker) |
| CI/CD | GitHub Actions |

Ver el [mapa tecnológico](docs/architecture/diagrams/puntualmed-mapa-tecnologico.png).

## Documentación

- [Documento de diseño](docs/design.md)
- [Modelo C4 (Structurizr DSL)](docs/architecture/workspace.dsl) y
  [diagramas renderizados](docs/architecture/diagrams/)
- [Decisiones de arquitectura (ADR)](docs/architecture/adr/)
- [Modelo de datos (DBML)](docs/database/schema.dbml)

## Estado

En implementacion, dado que documentación y maquetado en figma está finalizado, enlace de Figma: https://www.figma.com/design/5cYQJzLuLzDoyd7o1Ubv6A/PuntualMed?node-id=16-3&t=I5jZezukCMD6H236-1