# ADR-0002: React Native + Expo para el cliente móvil

- Estado: Aceptada
- Fecha: 2026-06-15

## Contexto

El proyecto es de la materia de Dispositivos Móviles y requiere una app móvil. En la
propuesta inicial se listaron React Native y Flutter simultáneamente, lo cual es un error:
son frameworks que compiten para el mismo fin. Hay que elegir uno. El equipo ya tiene base
de React/JavaScript.

## Decisión

Usar **React Native con Expo** como único framework móvil. El backend es Python (FastAPI),
independiente de esta elección.

## Consecuencias

**Positivas:**
- Curva de aprendizaje mínima al reutilizar conocimiento de React/JS.
- Expo simplifica y permite el manejo de notificaciones push.

**Negativas:**
- Para funciones nativas muy específicas se podría necesitar salir del "managed workflow" de Expo.

## Alternativas consideradas

- **Flutter:** excelente para UI pulida y demos, pero implicaría aprender Dart desde cero.
  Se descartó por el costo de aprendizaje frente a la base existente en JavaScript.
- **Mantener ambos (RN + Flutter):** descartado por completo; duplica el esfuerzo sin beneficio.
