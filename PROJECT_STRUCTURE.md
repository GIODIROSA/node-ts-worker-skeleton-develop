# Descripción de la Arquitectura del Proyecto

Este documento detalla la estructura de carpetas y archivos del proyecto, explicando el propósito de cada componente.

## Directorio Raíz

Contiene archivos de configuración globales para el proyecto.

- **`.env`**: Almacena variables de entorno para el desarrollo local (no versionado).
- **`.env.example`**: Archivo de ejemplo para las variables de entorno necesarias.
- **`.eslintrc.cjs`**: Configuración para ESLint, el linter de código.
- **`.gitignore`**: Especifica los archivos y carpetas que Git debe ignorar.
- **`.prettierrc`**: Reglas para Prettier, el formateador de código.
- **`package.json`**: Define los metadatos del proyecto, dependencias (como `bullmq`, `prisma`, `redis`) y scripts de ejecución (`start`, `dev`).
- **`tsconfig.json`**: Configuración del compilador de TypeScript.
- **`docker-compose.yml`**: Define los servicios para orquestación con Docker (ej. la aplicación, base de datos, Redis).
- **`Dockerfile`**: Instrucciones para construir la imagen Docker de la aplicación.

## `prisma/`

Gestiona todo lo relacionado con la base de datos a través de Prisma ORM.

- **`schema.prisma`**: Define el esquema de la base de datos, los modelos de datos (como `User`, `Email`, `Batch`) y la configuración del proveedor de base de datos.
- **`migrations/`**: Contiene las migraciones generadas por Prisma para versionar los cambios en el esquema de la base de datos.

## `src/`

Contiene todo el código fuente de la aplicación.

### `src/worker.ts`

Es el punto de entrada principal de la aplicación. Se encarga de inicializar las conexiones (Redis, base de datos), cargar los procesadores de trabajos (jobs) y poner en marcha el worker que escuchará las colas de BullMQ.

### `src/config/`

Almacena todos los archivos de configuración de la aplicación.

- **`bull.config.ts`**: Configuración específica para las colas de BullMQ.
- **`constants.ts`**: Define constantes globales usadas en la aplicación.
- **`logger.ts`**: Configuración del sistema de logging (probablemente Winston o similar).
- **`redis.ts`**: Configuración para la conexión con el cliente de Redis.
- **`trace-context.ts`**: Lógica para el seguimiento y contexto de trazas en logs y monitoreo.
- **`db/`**:
    - **`prisma.ts`**: Inicializa y exporta el cliente de Prisma para interactuar con la base de datos.

### `src/core/`

Contiene las clases y abstracciones base que forman el núcleo de la arquitectura del worker.

- **`base.processor.ts`**: Una clase abstracta de la que heredan todos los procesadores de trabajos. Estandariza la forma en que se procesan los jobs, se manejan los errores y se gestiona el ciclo de vida.
- **`queue-factory.ts`**: Una fábrica para crear y registrar nuevas colas de BullMQ de manera consistente.

### `src/jobs/`

Define los trabajos (jobs) que el worker procesará. Cada subdirectorio representa un tipo de trabajo.

- **`jobs.loader.ts`**: Script que importa dinámicamente todos los procesadores de trabajos definidos en este directorio y los inicializa.
- **`email/`**: Lógica para el trabajo de envío de correos.
    - **`email.constants.ts`**: Constantes específicas para la cola de emails (ej. nombre de la cola).
    - **`email.processor.ts`**: El procesador del trabajo. Contiene la lógica que se ejecuta cuando un job de tipo "email" es recogido de la cola. Interactúa con `email.service.ts`.
    - **`email.service.ts`**: Contiene la lógica de negocio para el envío de correos, como la interacción con la base de datos y el servicio de mail.
    - **`email.types.ts`**: Define los tipos de datos y la estructura esperada para un job de email.
    - **`templates/`**: Plantillas de correo (ej. en formato Handlebars `.hbs`).
- **`reports/`**: Lógica para la generación de reportes.
    - **`report.processor.ts`**: Procesador para los trabajos de generación de reportes.
    - **`report.service.ts`**: Lógica de negocio para crear los reportes.

### `src/libs/`

Contiene clientes, wrappers o librerías reutilizables que interactúan con servicios externos.

- **`mailer.lib.ts`**: Abstracción para el envío de correos (ej. usando Nodemailer). Es utilizado por `email.service.ts`.
- **`redis-client.lib.ts`**: Proporciona una instancia configurada del cliente de Redis para ser usada en la aplicación.
- **`template.lib.ts`**: Lógica para procesar y compilar plantillas de texto/HTML (ej. Handlebars).

### `src/utils/`

Almacena funciones de utilidad genéricas que pueden ser usadas en cualquier parte del proyecto.

- **`date.util.ts`**: Funciones para manipular y formatear fechas.
