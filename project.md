Este archivo define los estándares, restricciones y la arquitectura que el sistema debe seguir estrictamente.
🎯 Objetivo del Sistema

Desarrollar una infraestructura distribuida capaz de procesar envíos masivos de correos electrónicos de forma asíncrona, garantizando la persistencia en base de datos y la gestión de estados mediante colas.
🛠 Stack Tecnológico Obligatorio

    Backend: Node.js con TypeScript.

    API Framework: Express.

    Gestión de Colas: Bull (basado en Redis).

    Base de Datos: MySQL con Prisma ORM.

    Frontend: Next.js (App Router) y Tailwind CSS.

    Infraestructura: Docker y Docker Compose (MySQL, Redis, Mailtrap).

🏗 Arquitectura de Software

    Desacoplamiento: El Productor (API Server) y el Consumidor (Worker) deben ser procesos independientes.

    Flujo de Datos: 1. La API recibe la petición. 2. Registra la campaña en MySQL (EmailJob y Recipient). 3. Encola el ID del trabajo en Redis. 4. El Worker procesa el envío, actualiza MySQL y finaliza la tarea.

    Patrón de Diseño: Service-oriented architecture. Los controladores no deben contener lógica de negocio ni de base de datos directamente.

🛡 Reglas de Desarrollo

    Validación: Todas las peticiones entrantes deben ser validadas (Zod o Joi).

    Logging: Uso obligatorio de un Logger centralizado (Winston) con niveles info, debug y error.

    Error Handling: Implementar bloques try/catch globales y asegurar que los jobs fallidos en Bull tengan una estrategia de reintentos definida.

    Tipado: Prohibido el uso de any. Definir interfaces o tipos para cada payload y respuesta.

Documento 2: Detalle del Desafío (Especificaciones de Cápsula)

Este documento detalla los entregables y funcionalidades requeridas para cada capa del sistema.
1. Visión General y Negocio

El sistema debe permitir a un usuario crear "Campañas de Envío". Una campaña consta de un asunto, un cuerpo (HTML) y una lista de destinatarios. El sistema debe ser capaz de manejar miles de registros sin bloquear la interfaz de usuario.
2. Backend (Servidor y Worker)

    Endpoint de Creación: POST /api/emails. Debe recibir subject, body y un array de recipients.

    Endpoint de Monitoreo: GET /api/emails/:id. Debe retornar el estado real de la campaña (Porcentaje de avance, errores, completados).

    Lógica del Worker:

        Debe soportar concurrencia configurable (ej. procesar 5 correos simultáneamente).

        Debe actualizar el campo status en la tabla EmailJob (PENDING -> PROCESSING -> COMPLETED/FAILED).

        Integración con Nodemailer para la salida SMTP.

3. Modelo de Datos (Prisma Schema)

Es fundamental contar con las siguientes entidades:

    EmailJob: id, subject, body, status, totalEmails, sentEmails, failedEmails, createdAt, completedAt.

    Recipient: id, email, status (PENDING, SENT, FAILED), error, emailJobId (Relación 1:N con EmailJob).

4. Frontend (Next.js)

    Formulario de Envío: Interfaz para redactar el correo y cargar/pegar la lista de destinatarios.

    Dashboard de Seguimiento: * Lista de campañas enviadas con su estado actual.

        Barra de progreso en tiempo real (Polling o WebSockets) para campañas activas.

        Detalle de errores por destinatario en caso de falla.

5. Infraestructura local

El entorno debe levantarse con un solo comando (docker-compose up).

    MySQL: Puerto 3306.

    Redis: Puerto 6379.

    Mailtrap: Configurado como servidor SMTP falso para capturar los envíos de prueba sin enviar correos reales a internet.