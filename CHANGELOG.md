# Changelog

## [1.0.0] - 2025-12-21

### 🚀 Initial Release

Versión inicial del **Node.js TypeScript Worker Skeleton**. Este proyecto sirve como base para la creación de microservicios encargados de procesamiento en segundo plano (background jobs) utilizando Bull y Redis.

### ✨ Features

- **Arquitectura Modular**: Separación clara entre `processors` (infraestructura/cola) y `services` (dominio).
- **Queue System**: Implementación robusta con `bull` y `redis`, con soporte para reintentos y backoff exponencial.
- **Database Integration**: Integración con MySQL mediante **Prisma ORM**.
- **Logging Avanzado**: Sistema de logs estructurados con `winston`, incluyendo rotación diaria y contexto de traza (`traceId`) para seguimiento de jobs.
- **Email Support**: Librerías integradas para envío de correos (`nodemailer`) y renderizado de templates (`handlebars`).
- **Type Safety**: Desarrollo estricto con TypeScript.
- **Docker Ready**: Configuración completa con `Dockerfile` y `docker-compose` para desarrollo local y despliegue.
- **Developer Experience**:
  - Configuración de ESLint y Prettier.
  - Path aliases (`@config`, `@core`, `@jobs`, etc.).
  - Scripts de utilidad para seed y migraciones (via Prisma).

### 🛠 Tech Stack

- Node.js & TypeScript
- Bull & Redis
- Prisma & MySQL
- Winston
- Nodemailer & Handlebars
