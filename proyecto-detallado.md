# Documentación Técnica Detallada: Worker de Envío de Correos

Este archivo contiene la documentación técnica completa del proyecto "Worker Email". Está diseñado para explicar la arquitectura, el flujo de datos y la implementación específica del código a un nivel profundo.

## 1. Visión General del Sistema

El proyecto es un **Sistema de Procesamiento en Segundo Plano (Background Worker)** diseñado para enviar correos electrónicos masivos de manera asíncrona y escalable.

### Stack Tecnológico
*   **Lenguaje**: Node.js con TypeScript.
*   **Gestor de Colas**: Bull (librería) sobre Redis (motor en memoria).
*   **Base de Datos**: MySQL manejada con Prisma ORM.
*   **Contenedores**: Docker y Docker Compose.
*   **Email**: Nodemailer (transporte SMTP).

---

## 2. Arquitectura de Componentes

El sistema sigue el patrón **Productor-Consumidor**:

1.  **Productor (El Origen)**:
    *   En este caso, lo simulamos con un script (`scripts/test-job.ts`), pero en producción sería una API REST.
    *   Su función es insertar los datos en MySQL y poner un "identificador" (Job UUID) en la cola de Redis.

2.  **La Cola (Redis)**:
    *   Actúa como buffer. Almacena las tareas pendientes (`email-queue`) hasta que el worker esté libre.

3.  **Consumidor (El Worker)**:
    *   Es el servicio que siempre está corriendo (`node-ts-worker`).
    *   Escucha Redis, toma trabajos y ejecuta la lógica pesada (enviar correos).

---

## 3. Estructura del Código y Responsabilidades

Expliquemos archivo por archivo qué hace cada pieza dentro de `src/`:

### A. Punto de Entrada
*   **`src/worker.ts`**:
    *   **Qué hace**: Es el "cerebro" que arranca todo.
    *   **Detalle**: Inicializa la conexión a la base de datos, carga las variables de entorno y llama a `loadJobs()` para empezar a escuchar las colas.

### B. Configuración de Trabajos
*   **`src/jobs/jobs.loader.ts`**:
    *   **Qué hace**: Vincula las colas con sus procesadores.
    *   **Detalle**: Dice "La cola llamada `email-queue` debe ser procesada por la clase `EmailProcessor` usando 5 hilos simultáneos".

### C. El Procesador (Adaptador)
*   **`src/jobs/email/email.processor.ts`**:
    *   **Qué hace**: Recibe el mensaje "crudo" de Bull/Redis y se lo pasa a nuestra lógica de negocio.
    *   **Detalle**: Extrae el `jobUuid` del mensaje y llama a `EmailService.send()`. Es un intermediario limpio.

### D. El Servicio (Lógica de Negocio) - **CRÍTICO**
*   **`src/jobs/email/email.service.ts`**:
    *   **Qué hace**: Contiene toda la inteligencia del envío masivo.
    *   **Flujo Implementado (Paso a Paso):**
        1.  **Lectura**: Recibe el UUID, busca en la tabla `EmailJob` y trae a todos sus `Recipients` (destinatarios) relacionados.
        2.  **Actualización Global**: Marca el Job como `PROCESSING`.
        3.  **Bucle de Envío (El cambio importante)**:
            *   Itera uno por uno a los destinatarios.
            *   Envía el correo a *ese* destinatario específico (privacidad).
            *   Actualiza inmediatamente en la tabla `Recipient` si fue `SENT` (Enviado) o `FAILED` (Fallido).
        4.  **Cierre**: Cuenta cuántos éxitos y fallos hubo, actualiza el Job global como `COMPLETED` o `FAILED` y guarda las estadísticas.

---

## 4. Modelo de Datos (Base de Datos)

Definido en `prisma/schema.prisma`:

### `EmailJob` (La Campaña)
Representa el envío masivo global.
*   `id`: Identificador único.
*   `status`: PENDING -> PROCESSING -> COMPLETED.
*   `totalEmails`: Cantidad total a enviar.
*   `sentEmails` / `failedEmails`: Contadores finales.

### `Recipient` (El Destinatario)
Representa a cada persona individual dentro de una campaña.
*   `email`: La dirección de correo.
*   `status`: PENDING -> SENT o FAILED.
*   `error`: Si falló, aquí se guarda por qué (ej. "email inválido").
*   `emailJobId`: La llave foránea que lo une a la campaña.

---

## 5. Cambios Recientes Realizados

Se modificó `src/jobs/email/email.service.ts` para corregir dos fallos graves del diseño original:

1.  **Privacidad**: Antes se enviaba un solo correo con todos los destinatarios en copia oculta o visible. Ahora se envía **uno por uno** dentro de un ciclo `for`.
2.  **Trazabilidad**: Antes no se sabía qué usuario falló. Ahora se actualiza la tabla `Recipient` en tiempo real.

---

