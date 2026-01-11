🚀 Documento de Misión: Sistema de Envío Masivo de Correos
1. Contexto del Desafío

El objetivo es construir un sistema de envío masivo de correos electrónicos profesional y escalable que demuestre el dominio de arquitecturas distribuidas y procesamiento asíncrono. El sistema debe separar claramente las responsabilidades entre la recepción de datos (API) y el procesamiento de larga duración (Worker).
2. Objetivos Principales

    Procesamiento Asíncrono: Implementar colas de mensajes con Bull y Redis para gestionar el flujo de correos sin bloquear la aplicación.

    Arquitectura Distribuida: Mantener servicios independientes (API y Worker) que se comunican a través de eventos en Redis.

    Persistencia y Monitoreo: Registrar cada campaña y cada destinatario individual en una base de datos MySQL, permitiendo el seguimiento del progreso en tiempo real.

3. Requisitos Técnicos de la Misión
🛠️ Capa de Backend (Productor y Consumidor)

    API RESTful:

        POST /api/emails: Recibe un JSON con subject, body (HTML) y una lista de recipients. Debe validar los datos y encolar el trabajo.

        GET /api/emails/:id: Debe retornar el estado de la campaña, incluyendo cuántos correos se han enviado, cuántos han fallado y el estado general (PENDING, PROCESSING, COMPLETED).

    Worker:

        Debe escuchar la cola de Redis de forma continua.

        Debe implementar concurrencia configurable para procesar múltiples correos en paralelo.

        Debe actualizar el estado de la base de datos para cada destinatario y para el trabajo global.

        Integración obligatoria con Nodemailer para la salida de correos.

📊 Capa de Datos (MySQL + Prisma)

El schema de Prisma debe soportar la lógica de negocio:

    EmailJob: Entidad principal que agrupa el envío masivo.

    Recipient: Entidad que representa a cada suscriptor dentro de un job, con su propio estado de entrega y registro de errores si fallase.

💻 Capa de Frontend (Next.js)

    Interfaz de Creación: Un formulario limpio para redactar correos y cargar destinatarios.

    Dashboard de Control: Una vista que liste las campañas y muestre una barra de progreso real basada en el estado del backend.

🐳 Infraestructura (Docker)

El proyecto debe ser ejecutable mediante un entorno Dockerizado que incluya:

    MySQL: Base de datos relacional.

    Redis: Motor para las colas Bull.

    Mailtrap: Servidor SMTP de pruebas para interceptar los envíos.

4. Criterios de Éxito

    Fiabilidad: Si el worker se cae, los trabajos deben permanecer en Redis y reanudarse al reiniciarse el servicio.

    Seguimiento: El usuario debe poder ver en el frontend exactamente cuántos correos faltan por enviar en una campaña activa.

    Desacoplamiento: El servidor API no debe realizar ninguna tarea de envío de correos; su única misión es validar y encolar.