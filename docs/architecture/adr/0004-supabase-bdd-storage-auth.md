# ADR-0004: Supabase para base de datos, storage y auth

- Estado: Aceptada
- Fecha: 2026-06-15

## Contexto

La app necesita persistencia relacional (multiusuario), almacenamiento de fotos (recetas y
confirmaciones de toma) y autenticación. El presupuesto es cero y el equipo es pequeño;
implementar auth y storage desde cero sería costoso en tiempo.

## Decisión

Usar **Supabase** como plataforma única: **PostgreSQL** (base de datos), **Storage**
(fotos) y **Auth** (registro/login con emisión de JWT). El backend valida el JWT emitido
por Supabase.

## Consecuencias

**Positivas:**
- Free tier generoso que cubre los tres servicios en un solo proyecto.
- Evita reinventar autenticación y almacenamiento de archivos.
- PostgreSQL es robusto y adecuado para datos relacionales multiusuario.

**Negativas:**
- Acoplamiento a un proveedor (lock-in parcial); mitigado porque PostgreSQL es estándar y portable.
- Row Level Security queda como defensa en profundidad opcional; el aislamiento principal es por `user_id` en el backend.

## Alternativas consideradas

- **SQLite:** descartado; no es adecuado para una app multiusuario concurrente.
- **PostgreSQL autogestionado + auth propia + storage propio:** mayor control pero mucho más
  trabajo y costo operativo, innecesario a esta escala.
