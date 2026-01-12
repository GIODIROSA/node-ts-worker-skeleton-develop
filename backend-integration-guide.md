# Guía de Integración Backend - Worker Email

Este documento detalla los requisitos técnicos necesarios para construir el Backend (API) de forma que se comunique correctamente con el Worker de Email existente.

## 1. Stack Requerido
El Backend debe utilizar tecnologías compatibles con la infraestructura actual:
*   **Database**: MySQL (Debe conectarse a la misma base de datos `worker_db`).
*   **Queue**: Redis (Debe conectarse a la misma instancia `redis:6379`).
*   **ORM**: Prisma (Recomendado para compartir el esquema `schema.prisma`).
*   **Queue Library**: Bull (Recomendado) o BullMQ (compatible).

## 2. Contratos Compartidos

### A. Base de Datos (Schema)
El Backend **DEBE** usar el mismo modelo de datos. Copia el archivo `worker-email/prisma/schema.prisma` a tu proyecto Backend.

**Tablas Clave:**
*   `EmailJob`: El Backend **CREA** registros aquí con status `PENDING`.
*   `Recipient`: El Backend **CREA** registros aquí asociados al Job.

### B. Nombre de la Cola
Variable de entorno compartida:
```env
QUEUE_NAME_EMAIL=email-queue
```
Si el Backend envía a otra cola, el Worker nunca procesará el mensaje.

### C. Estructura del Payload (Redis)
Cuando el Backend agregue un trabajo a la cola usando Bull, el objeto `data` debe tener estricamente esta estructura:

```typescript
// Interface
interface EmailPayload {
  jobUuid: string; // UUID del registro en la tabla EmailJob
}

// Ejemplo de Encolado (Backend Code)
await emailQueue.add({
  jobUuid: '550e8400-e29b-41d4-a716-446655440000'
});
```

## 3. Flujo de Operación (Backend)

Para solicitar un envío masivo, el Backend debe seguir estos pasos en orden:

1.  **Validar**: Recibir Request HTTP (POST /send-campaign).
2.  **Persistir**:
    *   Crear `EmailJob` (status: PENDING).
    *   Crear N `Recipient`s asociados.
3.  **Encolar**:
    *   Conectar a Redis.
    *   Pushear `{ jobUuid: job.id }` a `email-queue`.
4.  **Responder**: Retornar `202 Accepted` al cliente con el `jobId`.

## 4. Checklist de Migración
- [ ] Copiar `prisma/schema.prisma` al nuevo proyecto.
- [ ] Copiar variables de entorno `.env` (DATABASE_URL, REDIS_URL).
- [ ] Instalar dependencias: `bull`, `@prisma/client`.
- [ ] Implementar endpoint Controlador.

---
**Nota sobre Rate Limiting**:
El worker ya tiene integrado un delay de seguridad (10 segundos) para cuentas gratuitas de SMTP. El Backend NO necesita preocuparse por la velocidad de encolado; puede encolar miles de jobs por segundo y el Worker los procesará a su ritmo.
