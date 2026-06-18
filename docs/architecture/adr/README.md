# Architecture Decision Records (ADR)

Cada ADR documenta una decisión de arquitectura importante: su contexto, la decisión
tomada, sus consecuencias y las alternativas que se consideraron. Son cortos, inmutables
(si una decisión cambia, se crea un ADR nuevo que supersede al anterior) y numerados.

Formato basado en [MADR](https://adr.github.io/madr/).

## Índice

| # | Decisión | Estado |
|---|----------|--------|
| [0001](0001-monolito-modular.md) | Monolito modular en lugar de microservicios | Aceptada |
| [0002](0002-react-native-expo.md) | React Native + Expo para el cliente móvil | Aceptada |
| [0003](0003-proveedor-ia-glm.md) | GLM (Zhipu) tras una interfaz `AIProvider` | Aceptada |
| [0004](0004-supabase-bdd-storage-auth.md) | Supabase para base de datos, storage y auth | Aceptada |
| [0005](0005-worker-separado-apscheduler.md) | Worker separado con APScheduler para tareas programadas | Aceptada |
| [0006](0006-github-actions-ci-cd.md) | GitHub Actions para CI/CD | Aceptada |

## Plantilla

```markdown
# ADR-NNNN: Título

- Estado: Propuesta | Aceptada | Rechazada | Supersedida por ADR-XXXX
- Fecha: YYYY-MM-DD

## Contexto
Qué problema o fuerza motiva esta decisión.

## Decisión
Qué se decidió.

## Consecuencias
Positivas y negativas que se aceptan.

## Alternativas consideradas
Qué más se evaluó y por qué se descartó.
```
