# Configuración del Proyecto

Este directorio `src/config` centraliza toda la configuración de la aplicación, variables de entorno y utilidades transversales como logging y trazabilidad.

## Archivos y Responsabilidades

### 1. `constants.ts`

Define las constantes globales y carga las variables de entorno usando `dotenv`.

- **Uso**: Importar `ENV` para acceder a cualquier configuración.
- **Ejemplo**:
  ```typescript
  import { ENV } from "@config/constants";
  console.log(ENV.NODE_ENV); // 'development'
  ```

### 2. `logger.ts`

Configuración del sistema de logging utilizando `winston`. Provee una clase `Logger` que soporta múltiples contextos.

#### Uso Recomendado (Con Contexto Explicito)

Para tener logs categorizados por módulo o servicio, use `Logger.getLogger('NombreContexto')`.

```typescript
import Logger from "@config/logger";

// 1. Obtener una instancia con contexto específico
const logger = Logger.getLogger("EmailService");

// 2. Usar esa instancia
logger.info("Enviando correo...");
// Salida Log: [TIMESTAMP] [INFO ] [EmailService] [-] Enviando correo...

logger.error("Fallo el envío", { error: err });
```

#### Uso Estático (Contexto Default 'app')

Para logs generales y rápidos, puede usar los métodos estáticos directamente.

```typescript
import Logger from "@config/logger";

Logger.info("Aplicación iniciada");
// Salida Log: [TIMESTAMP] [INFO ] [app] [-] Aplicación iniciada
```

### 3. `bull.config.ts`

Define la configuración por defecto para las colas de Bull (Redis backed queues).

- **Configuración**: Establece la URL de Redis y opciones por defecto de los Jobs (reintentos, backoff).
- **Uso**: Utilizado automáticamente por `QueueFactory` al crear nuevas colas.

### 4. `redis.ts`

Establece una conexión directa a Redis usando `ioredis`.

- **Propósito**: Útil para operaciones directas de caché o pub/sub fuera del sistema de colas.
- **Eventos**: Loguea automáticamente cuando la conexión se establece o falla.

### 5. `trace-context.ts`

Implementación de `AsyncLocalStorage` para mantener el contexto de una solicitud (Trace ID) a través de operaciones asíncronas.

- **Propósito**: Permite que todos los logs generados durante el procesamiento de un Job compartan el mismo ID de seguimiento sin pasarlo manualmente.
- **Uso**: Integrado en `BaseProcessor`.
