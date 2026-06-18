# PuntualMed — Documento de Diseño

> **Fecha:** 2026-06-15
> **Tipo:** App móvil de gestión y adherencia a tratamientos médicos.
> **Proyecto:** Final de la materia de Dispositivos Móviles.

---

## 1. Resumen del producto

**PuntualMed** es una app móvil que ayuda a las personas a **tomar correctamente sus
medicamentos** y a **dar seguimiento a su tratamiento**, con apoyo de un agente de IA.

Diferenciador: combina recordatorios + confirmación con foto + alerta a un familiar +
lectura de recetas por IA (visión) + un agente que analiza síntomas y adherencia. Es
**agnóstica a la enfermedad** (sirve para cualquier medicamento/tratamiento), o sea
"multienfermo" por diseño, sin hardware: la app es el "cerebro" (inspirado en dispositivos
como el robot Pillo o pastilleros con alarma, pero todo en software).

### Branding

- **Nombre:** PuntualMed
- **Logo (idea):** cerebro + cápsula (pastilla) fusionados, minimalista, líneas suaves.
- **Paleta de colores** (psicología aplicada):
  | Color | Hex | Significado |
  |-------|-----|-------------|
  | Azul profundo | `#1E3A8A` | confianza médica |
  | Celeste | `#38BDF8` | tecnología + calma |
  | Verde menta | `#34D399` | salud / mejora |
  | Gris claro | `#F3F4F6` | limpieza clínica |

---

## 2. Decisiones tomadas (y por qué)

| Decisión | Elección | Razón |
|----------|----------|-------|
| **Arquitectura** | **Monolito modular** (API) + **worker de fondo** separado | Microservicios para un proyecto de este alcance es over-engineering: pagas el costo de sistemas distribuidos sin el beneficio organizacional (Ley de Conway). El monolito modular es "microservices-ready": las costuras ya están marcadas. El worker se separa porque un scheduler es legítimamente otro runtime. |
| **Móvil** | **React Native + Expo** | Hay base previa de React/JS. Expo simplifica build de APK y push notifications. Un solo codebase. |
| **Backend** | **Python + FastAPI** (async) | Rápido de escribir, tipado, docs OpenAPI automáticas. |
| **Scheduler/worker** | **Python + APScheduler** (proceso aparte) | Revisa horarios, dispara recordatorios y alertas de Telegram. |
| **Base de datos** | **PostgreSQL** (vía Supabase) | Relacional, robusto, free tier. SQLite descartado (multiusuario). |
| **Storage de fotos** | **Supabase Storage** | Guarda fotos de recetas y de confirmación de toma. |
| **Auth** | **Supabase Auth** (JWT) | Login/registro sin reinventar la rueda. El backend valida el JWT. |
| **IA (visión + texto)** | **GLM Flash (Zhipu)** detrás de una interfaz `AIProvider` | `GLM-4V-Flash` (visión, gratis) lee recetas; `GLM-4-Flash` (texto, gratis) razona síntomas/adherencia. Intercambiable: cambiar a Claude/Gemini = una línea de config. |
| **Notificaciones** | **Telegram Bot API** (al familiar) + **Expo Push** (al usuario) | Telegram es gratis y directo; Expo Push para recordatorios nativos. |
| **Deploy** | Render/Railway (API + worker) · Supabase (DB/storage/auth) · EAS (APK) | Free tier. |

---

## 3. Requisitos funcionales y trazabilidad

Los 5 requisitos del documento original, mapeados a módulos/flujos. **Cobertura: 100%.**

| # | Requisito | Cubierto por | ¿Usa foto? |
|---|-----------|--------------|------------|
| **1** | Ingresar medicamentos + horarios + duración del tratamiento, **manual o por foto de receta** (autocompleta campos detectados; el resto se llena a mano). | `meds` + `ai.extract_prescription()` (GLM-4V) | Sí (opcional) |
| **2** | Registrar **síntomas inusuales**; el agente IA los analiza y sugiere posibles causas para que el usuario acuda al médico. | `symptoms` + `ai.analyze_symptoms()` | No (solo texto) |
| **3** | **Recordatorios** de toma; el usuario confirma con **foto**; si no toma/registra a tiempo → **alerta por Telegram** a un familiar de seguimiento. | `reminders` + `worker` + `notifications` | Sí (confirmación) |
| **4** | **Calendario** que visualiza días: tomado correctamente / no tomado / con síntomas. | `calendar` (agrega `reminders` + `symptoms`) | — |
| **5** | **Consultas al agente IA**: ¿tomé bien el tratamiento? → informe de días fallados; y efectos secundarios sufridos de un medicamento específico. | `ai.check_adherence()` + `ai.side_effects_report()` | No (solo texto) |

### Requisitos no funcionales
- **Fail fast, fail loud:** errores explícitos; nunca silenciar fallos.
- **Resiliencia de IA:** si el OCR falla → fallback a entrada manual (el flujo no se rompe).
- **Privacidad:** datos médicos sensibles; cada usuario solo accede a lo suyo (filtrado por `user_id` del JWT).
- **Tests:** unitarios por módulo; IA, Telegram y DB mockeados.
- **Idempotencia:** el worker no debe duplicar recordatorios ni alertas.

---

## 4. Arquitectura general

```
┌─────────────────────────────┐
│   APP MÓVIL (React Native)  │
│   Expo · push notifications │
└──────────────┬──────────────┘
               │ HTTPS / REST (JWT de Supabase)
               ▼
┌─────────────────────────────────────────────┐
│        BACKEND — Monolito Modular (FastAPI)   │
│                                               │
│  ┌────────┐ ┌────────┐ ┌──────────┐           │
│  │ users  │ │  meds  │ │reminders │           │
│  └────────┘ └────────┘ └──────────┘           │
│  ┌──────────┐ ┌────────┐ ┌──────────────┐     │
│  │ symptoms │ │   ai   │ │ notifications│     │
│  └──────────┘ └───┬────┘ └──────┬───────┘     │
│  ┌──────────┐     │             │             │
│  │ calendar │     │ AIProvider  │             │
│  └──────────┘     │ (interfaz)  │             │
└────────┬──────────┼─────────────┼─────────────┘
         │          │             │
         ▼          ▼             ▼
   ┌──────────┐ ┌─────────┐  ┌──────────┐
   │PostgreSQL│ │GLM Flash│  │ Telegram │
   │ +Storage │ │(visión+ │  │   Bot    │
   │(Supabase)│ │ texto)  │  └──────────┘
   └──────────┘ └─────────┘
         ▲
         │ lee horarios y dispara eventos
┌────────┴───────────────────┐
│  WORKER (APScheduler)       │
│  · recordatorios de toma    │
│  · alerta familiar si falla │
└─────────────────────────────┘
```

Dos procesos desplegables: **API** (FastAPI) y **Worker** (APScheduler). Comparten el mismo
código de dominio y la misma DB, pero corren por separado.

### 4.1 Modelo C4 formal (Structurizr)

El ASCII de arriba es la **vista rápida**. El **modelo C4 formal** (niveles 1–3: Contexto,
Contenedores, Componentes) es la fuente de verdad de la arquitectura y vive en:

**`docs/architecture/workspace.dsl`** — Structurizr DSL (de Simon Brown, creador del modelo C4).

Un solo archivo de texto define el modelo y genera los 3 diagramas coherentes entre sí.
Lleva la paleta de PuntualMed. Ver en: https://structurizr.com/dsl

Vistas que genera el `workspace.dsl`:
- **1 Contexto** · **2 Contenedores** · **3 Componentes** (del backend `api`).
- **Dinámicas:** `FlujoTomaConfirmada` y `FlujoAlertaFamiliar` (secuencia de los flujos clave).
- **Despliegue:** contenedores mapeados a la infra real (Render, Supabase, dispositivo Android).

El nivel 4 (Código) se omite a propósito: lo cubren el modelo de datos (§6) y `AIProvider` (§7).

---

## 5. Módulos de dominio

Cada módulo tiene **una responsabilidad única**, expone una **interfaz clara** (servicio) y
es testeable de forma aislada. Estructura sugerida por módulo:
`router.py` (endpoints) · `service.py` (lógica) · `models.py` (ORM) · `schemas.py` (Pydantic) · `repository.py` (acceso a datos).

| Módulo | Responsabilidad única | Depende de |
|--------|----------------------|------------|
| `users` | Registro/perfil; vincular **familiar de seguimiento** (chat_id Telegram); guardar Expo push token. | Supabase Auth |
| `meds` | CRUD de medicamentos, dosis, frecuencia, **duración del tratamiento**; horarios de toma. | `users` |
| `reminders` | Generar tomas programadas; registrar cada toma (estado + foto de confirmación). | `meds`, Storage |
| `symptoms` | Registrar síntomas inusuales por fecha, asociados o no a un medicamento. | `users`, `meds` |
| `ai` | OCR de receta → JSON; análisis de síntomas; adherencia; efectos secundarios. Todo tras `AIProvider`. | `meds`, `symptoms`, `reminders` (lee historial) |
| `notifications` | Enviar mensajes a Telegram y push a Expo. | `users` |
| `calendar` | Agregar adherencia: por día → tomado / no tomado / con síntomas. | `reminders`, `symptoms` |

---

## 6. Modelo de datos (PostgreSQL)

Esquema relacional. Toda tabla de datos de usuario lleva `user_id` para aislamiento.
IDs como `UUID`. Timestamps en UTC (`timestamptz`).

### `profiles`
Extiende el usuario de Supabase Auth.
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | = `auth.users.id` de Supabase |
| `full_name` | text | |
| `expo_push_token` | text null | para recordatorios push |
| `created_at` | timestamptz | default now() |

### `caregivers` (familiares de seguimiento)
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → profiles | |
| `name` | text | |
| `telegram_chat_id` | text null | se llena tras el flujo de vinculación |
| `link_token` | text null | token temporal para vincular el chat de Telegram |
| `linked_at` | timestamptz null | |
| `created_at` | timestamptz | |

### `medications`
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → profiles | |
| `name` | text | nombre del medicamento |
| `dose` | text | ej. "500 mg" |
| `frequency_hours` | int null | cada cuántas horas (alternativa a horarios fijos) |
| `start_date` | date | inicio del tratamiento |
| `duration_days` | int | **duración del tratamiento** |
| `end_date` | date | derivado: start_date + duration_days |
| `notes` | text null | |
| `source` | text | `manual` \| `ocr` |
| `active` | bool | default true |
| `created_at` | timestamptz | |

### `medication_schedules` (horarios de toma)
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `medication_id` | UUID FK → medications | |
| `time_of_day` | time | ej. 08:00, 16:00, 00:00 |

### `intake_logs` (tomas)
Una fila por cada toma programada dentro de la duración del tratamiento.
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → profiles | |
| `medication_id` | UUID FK → medications | |
| `scheduled_at` | timestamptz | momento programado de la toma |
| `status` | text | `pending` \| `taken` \| `missed` |
| `confirmed_at` | timestamptz null | cuándo confirmó el usuario |
| `photo_url` | text null | foto de confirmación (Storage) |
| `alert_sent` | bool | default false (idempotencia de la alerta) |
| `created_at` | timestamptz | |

### `symptoms`
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → profiles | |
| `medication_id` | UUID FK → medications null | síntoma puede o no estar ligado a un med |
| `description` | text | |
| `severity` | text null | `leve` \| `moderado` \| `severo` |
| `occurred_at` | timestamptz | |
| `created_at` | timestamptz | |

### `prescriptions` (recetas escaneadas)
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → profiles | |
| `image_url` | text | foto de la receta (Storage) |
| `extracted_json` | jsonb null | salida estructurada del OCR de IA |
| `status` | text | `processing` \| `done` \| `failed` |
| `created_at` | timestamptz | |

### `ai_messages` (historial de chat con el agente)
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → profiles | |
| `kind` | text | `symptom_analysis` \| `adherence` \| `side_effects` |
| `role` | text | `user` \| `assistant` |
| `content` | text | |
| `created_at` | timestamptz | |

> ERD visual en `docs/database/schema.dbml` (render en https://dbdiagram.io). Migraciones con Alembic.

---

## 7. Interfaz `AIProvider` (clave de la portabilidad de IA)

El módulo `ai` depende de una **abstracción**, no de GLM directamente (inversión de
dependencias). Cambiar de proveedor = nueva implementación + cambio de config.

```python
# ai/provider.py (boceto conceptual, no final)
from typing import Protocol

class AIProvider(Protocol):
    # OCR de receta -> JSON estructurado de medicamentos (usa visión)
    async def extract_prescription(self, image_bytes: bytes) -> dict: ...

    # Analiza sintomas; devuelve texto con disclaimer obligatorio (solo texto)
    async def analyze_symptoms(self, symptoms: list[dict], meds: list[dict]) -> str: ...

    # Informe de adherencia a partir del historial de tomas (solo texto)
    async def check_adherence(self, intake_history: list[dict]) -> str: ...

    # Efectos secundarios sufridos de un medicamento especifico (solo texto)
    async def side_effects_report(self, medication: dict, symptoms: list[dict]) -> str: ...


class GLMProvider:
    # Implementacion por defecto: GLM-4V-Flash (vision) + GLM-4-Flash (texto)
    ...
```

- **Disclaimer médico:** el agente **nunca diagnostica de forma afirmativa**. Se inyecta un
  disclaimer en el prompt del sistema de TODOS los métodos de texto de salud ("Esto no
  reemplaza una consulta médica; acude a un profesional"), y el `service` valida que la
  respuesta lo incluya.
- **Salida estructurada del OCR:** se valida contra un schema (Pydantic) antes de prellenar
  el formulario; si no valida → `status=failed` y se ofrece entrada manual.

---

## 8. API REST (borrador de endpoints)

Todos bajo `/api/v1`, autenticados con JWT de Supabase (excepto registro/login que maneja
Supabase). Filtrado por `user_id` del token.

| Método | Ruta | Módulo | Descripción |
|--------|------|--------|-------------|
| `POST` | `/users/me/caregiver` | users | Crear familiar + generar `link_token` de Telegram |
| `POST` | `/users/me/push-token` | users | Guardar Expo push token |
| `GET/POST` | `/medications` | meds | Listar / crear medicamento (manual) |
| `PATCH/DELETE` | `/medications/{id}` | meds | Editar / desactivar |
| `POST` | `/medications/{id}/schedules` | meds | Definir horarios de toma |
| `POST` | `/prescriptions/scan` | ai | Subir foto de receta → JSON prellenado (OCR) |
| `GET` | `/intakes` | reminders | Tomas (con filtros de fecha/estado) |
| `POST` | `/intakes/{id}/confirm` | reminders | Confirmar toma con foto |
| `GET/POST` | `/symptoms` | symptoms | Listar / registrar síntoma |
| `POST` | `/ai/symptoms/analyze` | ai | Analizar síntomas (texto) |
| `POST` | `/ai/adherence` | ai | Informe de adherencia (texto) |
| `POST` | `/ai/side-effects` | ai | Efectos secundarios de un med (texto) |
| `GET` | `/calendar` | calendar | Datos del calendario por rango de fechas |

---

## 9. Flujos clave (paso a paso)

### 9.1 Alta de medicamento por foto de receta (req. 1)
1. App captura/sube foto → `POST /prescriptions/scan`.
2. `ai.extract_prescription(image)` → GLM-4V devuelve JSON (name, dose, frequency, duration).
3. Se valida contra schema. Si OK → app muestra formulario **prellenado**.
4. Usuario completa/corrige campos faltantes → `POST /medications` (`source=ocr`).
5. Se crean los `medication_schedules`.
6. **Fallback:** si el OCR falla → formulario vacío, entrada 100% manual.

### 9.2 Recordatorio + confirmación + alerta familiar (req. 3)
1. **Worker** (APScheduler) corre periódicamente (ej. cada minuto).
2. Genera/los `intake_logs` `pending` cuya `scheduled_at` llegó → `notifications` manda **push Expo** al usuario.
3. Usuario abre la app y confirma con foto → `POST /intakes/{id}/confirm` → `status=taken`, guarda `photo_url`.
4. Si pasa el **plazo de gracia** (ej. 30 min) sin confirmar → worker marca `status=missed` y, si `alert_sent=false`, `notifications` manda **Telegram** al familiar (luego `alert_sent=true`, idempotente).

### 9.3 Análisis de síntomas (req. 2) — solo texto
1. Usuario registra síntoma → `POST /symptoms`.
2. Usuario consulta → `POST /ai/symptoms/analyze`.
3. `ai.analyze_symptoms(symptoms, meds)` lee historial → GLM-4-Flash razona.
4. Respuesta con posibles causas + **disclaimer obligatorio**. Se guarda en `ai_messages`.

### 9.4 Consultas de adherencia y efectos secundarios (req. 5) — solo texto
- **Adherencia:** `POST /ai/adherence` → lee `intake_logs` → informe de días fallados.
- **Efectos secundarios:** `POST /ai/side-effects` (med específico) → cruza `symptoms` ligados a ese med → resumen.

### 9.5 Calendario (req. 4)
- `GET /calendar?from=...&to=...` → `calendar` agrega por día: tomado / no tomado / con síntomas. La app pinta el calendario con la paleta (verde menta = tomado, etc.).

### 9.6 Vinculación del familiar por Telegram
1. `POST /users/me/caregiver` → genera `link_token`.
2. App muestra link/deep-link al bot de Telegram con el token (ej. `t.me/PuntualMedBot?start=<token>`).
3. El familiar abre el bot y le da Start → el bot recibe el `chat_id` + token → backend guarda `telegram_chat_id` y marca `linked_at`.

---

## 10. Integraciones externas

| Servicio | Uso | Notas |
|----------|-----|-------|
| **Supabase** | Postgres + Storage (fotos) + Auth (JWT) | Free tier. El backend valida el JWT; RLS opcional como defensa en profundidad. |
| **Zhipu GLM** | `GLM-4V-Flash` (visión, OCR receta) + `GLM-4-Flash` (texto) | Free tier. Tras `AIProvider`. Requiere API key. |
| **Telegram Bot API** | Alertas al familiar + flujo de vinculación | Gratis. Requiere bot token (BotFather). |
| **Expo Push** | Recordatorios al usuario | Gratis. Requiere Expo push token del dispositivo. |

---

## 11. Despliegue

| Componente | Plataforma | Notas |
|------------|-----------|-------|
| API (FastAPI) | Render / Railway / Fly.io | En Render free el servicio "duerme"; aceptable para demo. |
| Worker (APScheduler) | Render/Railway como "background worker" | Proceso separado del API. |
| DB + Storage + Auth | Supabase | Un solo proyecto. |
| App (APK) | **Expo EAS Build** | Genera APK; repartir directo o Firebase App Distribution. |

### 11.1 CI/CD, contenedores y calidad

- **GitHub** como control de versiones.
- **Docker:** API y Worker se empaquetan en imágenes; Render despliega desde Docker.
- **GitHub Actions (CI/CD):** en cada push/PR corre lint + tests del backend y construye las
  imágenes. Ver ADR-0006.
- **Calidad:** los tests por módulo (§12) son el gate mínimo. SonarCloud queda como opción futura.

---

## 12. Estrategia de testing

- **Unitarios por módulo** (AAA: Arrange, Act, Assert), deterministas y aislados.
- **Mocks** para: `AIProvider` (no llamar a GLM real en tests), Telegram, Supabase Storage.
- **Casos borde obligatorios:** OCR que falla → fallback manual; toma fuera del plazo →
  alerta una sola vez (idempotencia); usuario sin familiar vinculado → no rompe el worker;
  respuesta de IA sin disclaimer → se rechaza/reintenta.
- Cada función pública con al menos un test.
