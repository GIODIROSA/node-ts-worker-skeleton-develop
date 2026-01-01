# 🚀 Node.js TypeScript Worker Skeleton

Esqueleto base (boilerplate) diseñado para construir microservicios de procesamiento en segundo plano ("workers") robustos y escalables utilizando **Node.js**, **TypeScript**, **Bull** y **Redis**.

Este proyecto está preconfigurado con una arquitectura modular, integración con base de datos, sistema de logs avanzado y herramientas de desarrollo listas para usar.

## ✨ Características Principales

- **Arquitectura Modular**: Organización limpia separando `processors` (lógica de colas) de `services` (lógica de negocio puro).
- **Gestión de Colas**: Implementación completa de **Bull** sobre **Redis**, con configuración de reintentos, backoff exponencial y limpieza automática.
- **Base de Datos**: Integración con **MySQL** utilizando **Prisma ORM** como capa de acceso a datos.
- **Logging Estructurado**: Sistema de logs con **Winston** que implementa rotación diaria de archivos y **Contextual Tracing** (cada log lleva el ID del job asociado).
- **Email & Templates**:
  - `MailerLib`: Wrapper sobre **Nodemailer** para envío de correos.
  - `TemplateLib`: Motor de plantillas con **Handlebars**.
- **Configuración Centralizada**: Gestión estricta de variables de entorno mediante `dotenv` y constantes tipadas.
- **Docker Ready**: Infraestructura contenerizada con `Dockerfile` y `docker-compose.yml` listos para levantar el entorno completo (Worker + Redis).
- **Quality Assurance**: Configuración de **ESLint** + **Prettier** para mantener la calidad del código.

## 🏗️ Arquitectura y Estructura

El proyecto sigue una estructura que favorece la separación de responsabilidades:

```
node-ts-worker-skeleton/
├── src/
│   ├── config/                # Configuraciones globales (DB, Logger, Redis, Constantes)
│   ├── core/                  # Abstracciones base (BaseProcessor, QueueFactory)
│   ├── jobs/                  # Módulos de Jobs (Feature-based)
│   │   ├── email/             # Ejemplo: Job de envío de correos
│   │   │   ├── templates/     # Templates .hbs específicos de este módulo
│   │   │   ├── email.processor.ts # Lógica de interacción con Bull
│   │   │   └── email.service.ts   # Lógica de negocio (DB updates, envío)
│   │   └── reports/           # Ejemplo: Job de generación de reportes
│   └── libs/                  # Librerías internas y wrappers (Mailer, Prisma, RedisClient)
│   └── utils/                 # Funciones de utilidad puras (Date, String)
├── prisma/                    # Esquema y migraciones de Prisma
├── .env.example               # Template de variables de entorno
├── Dockerfile
└── docker-compose.yml
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js >= 18
- Redis (o Docker para usar la imagen incluida)
- MySQL (para persistencia de jobs)

### 📥 Pasos de Instalación

1.  **Clonar y configurar dependencias:**

    ```bash
    npm install
    ```

2.  **Configurar variables de entorno:**

    Copia el archivo de ejemplo y ajusta los valores necesarios (Redis URL, DB credentials, SMTP).

    ```bash
    cp .env.example .env
    ```

3.  **Base de Datos (Prisma):**

    Genera el cliente de Prisma:

    ```bash
    npx prisma generate
    ```

    (Opcional) Si necesitas sincronizar el esquema con tu BD local:

    ```bash
    npx prisma db push
    ```

## 🏃‍♂️ Ejecución

### Entorno de Desarrollo

Para levantar todo el entorno (Redis + MySQL) si no lo tienes localmente:

```bash
docker-compose up -d
```

Iniciar el worker con "hot-reload":

```bash
npm run dev
```

### Entorno de Producción

Para compilar y ejecutar la versión optimizada:

```bash
npm run build
npm start
```

## 🛠 Comandos Disponibles

| Comando             | Descripción                                                                          |
| :------------------ | :----------------------------------------------------------------------------------- |
| `npm run dev`       | Inicia el worker en modo desarrollo con reinicio automático.                         |
| `npm run build`     | Compila el código TypeScript a JavaScript en `dist/` y copia los assets (templates). |
| `npm start`         | Ejecuta el código compilado (producción).                                            |
| `npm run lint`      | Ejecuta el linter para buscar errores de estilo.                                     |
| `npm run format`    | Corrige automáticamente el formato del código con Prettier.                          |
| `npm run docker:up` | Levanta los servicios definidos en `docker-compose`.                                 |

## 🧩 Cómo crear un nuevo Job

1.  Crea una nueva carpeta en `src/jobs/` (ej: `image-processing`).
2.  Define la interfaz del payload en `image.types.ts`.
3.  Implementa la lógica de negocio en `image.service.ts`.
4.  Crea el procesador extendiendo `BaseProcessor` en `image.processor.ts`.
5.  Registra el nuevo job y su cola en `src/jobs/jobs.loader.ts`.
6.  ¡Listo! El worker comenzará a escuchar la nueva cola automáticamente.

---

**v1.0.0**
