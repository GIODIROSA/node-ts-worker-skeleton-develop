# Core del Worker

El directorio `src/core` contiene los componentes fundamentales que abstraen la complejidad de Bull y Redis, proporcionando una interfaz estandarizada para la creación de colas y el procesamiento de trabajos.

## Componentes Principales

### 1. `QueueFactory`

Clase estática encargada de la gestión del ciclo de vida de las colas.

- **Problema que resuelve**: Bull abre múltiples conexiones a Redis por cada cola. Sin un control centralizado, es fácil agotar los recursos de conexión o perder referencias a las colas.
- **Patrón**: Singleton Registry.
- **Características**:
  - Reutilización de instancias (si pides la misma cola dos veces, te devuelve la misma instancia).
  - Configuración centralizada (aplica defaults automáticamente).
  - Cierre masivo (`closeAll`) para apagado seguro.

**Ejemplo de uso**:

```typescript
import { QueueFactory } from "@core/queue-factory";
import { ENV } from "@config/constants";

// Crear u obtener una cola
const emailQueue = QueueFactory.getQueue(ENV.QUEUE_NAMES.EMAIL);

// Agregar un trabajo
emailQueue.add({ email: "usuario@ejemplo.com" });
```

---

### 2. `BaseProcessor`

Clase abstracta genérica `<T>` que define el contrato para cualquier procesador de trabajos.

- **Problema que resuelve**: Evita repetir código de logging (`start`/`finish`/`error`) y manejo de errores (try/catch/done) en cada archivo de proceso.
- **Patrón**: Template Method / Wrapper.
- **Características**:
  - **Traza Automática**: Inyecta el ID del trabajo en el contexto de traza (`traceLogger`) automáticamente.
  - **Logging Estándar**: Registra cuándo inicia y termina un trabajo, y cuánto tiempo tomó.
  - **Seguridad**: Envuelve la ejecución en un `try/catch` para asegurar que siempre se llame a `done()`.

**Cómo implementar un nuevo procesador**:

1. Crear una clase que extienda `BaseProcessor<MyPayloadType>`.
2. Implementar el método `process`.

```typescript
// Define el tipo de datos del trabajo
interface MyPayload {
  userId: string;
}

export class MyProcessor extends BaseProcessor<MyPayload> {
  // Implementa la lógica de negocio
  protected async process(
    job: Job<MyPayload>,
    done: DoneCallback
  ): Promise<void> {
    // Tu lógica aquí
    await someService.doWork(job.data.userId);

    // Bull manejará el éxito automáticamente si la promesa se resuelve sin error,
    // pero siempre es buena práctica llamar a done() explícitamente si se usa callback style
    done();
  }
}
```

**Registro en el Worker**:

```typescript
// En worker.ts
const myQueue = QueueFactory.getQueue("my-queue-name");
// Obtenemos la función "envuelta" con toda la lógica de logging y trace
myQueue.process(new MyProcessor().getProcessor());
```
