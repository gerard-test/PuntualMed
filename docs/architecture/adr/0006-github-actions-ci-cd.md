# ADR-0006: GitHub Actions para CI/CD

- Estado: Aceptada
- Fecha: 2026-06-15

## Contexto

El proyecto se versiona en GitHub y se busca una práctica profesional de integración
continua: que cada cambio pase pruebas y verificaciones automáticas antes de integrarse, y
que la construcción de imágenes sea reproducible. El stack alternativo del equipo proponía
GitHub Actions, Docker y SonarQube en una capa de "DevOps y Calidad".

## Decisión

Usar **GitHub Actions** como pipeline de CI/CD. En cada push y pull request:

- Instala dependencias y corre **lint + tests** del backend.
- Construye las imágenes **Docker** de API y Worker.

Docker ya es parte del despliegue (Render despliega desde imágenes). **SonarQube/SonarCloud**
y **Redis** quedan fuera de esta versión (YAGNI / costo); se documentan en la reconciliación
de stack (§2.1 del diseño) como mejoras futuras.

## Consecuencias

**Positivas:**
- Integrado con GitHub, sin infraestructura adicional ni costo en repos públicos.
- Detecta fallos de tests y estilo antes de mergear.
- Builds de imágenes reproducibles.

**Negativas:**
- El pipeline hay que mantenerlo (versiones de acciones, tiempos de build).

## Alternativas consideradas

- **Sin CI (correr tests a mano):** descartado; frágil y poco profesional.
- **Otros CI (GitLab CI, CircleCI):** válidos, pero GitHub Actions es lo natural al estar el
  repositorio en GitHub.
- **Añadir SonarQube ahora:** pospuesto; aporta poco frente al costo de configurarlo a esta escala.
