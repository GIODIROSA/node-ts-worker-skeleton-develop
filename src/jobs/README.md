# Jobs y Procesamiento en Segundo Plano

Este directorio contiene la definición de todas las tareas asíncronas (Jobs) que el worker es capaz de procesar.

## Arquitectura de un Módulo de Job

Cada tipo de trabajo se organiza en su propia carpeta (ej: `email/`, `reports/`) para mantener la cohesión. Un módulo típico consta de:

1.  **`processor.ts`**:
    - **Rol**: Controlador.
    - **Responsabilidad**: Extiende `BaseProcessor` para heredar logging y manejo de errores. Orquesta la llamada al servicio de negocio.
    - **Ejemplo**: `EmailProcessor`.

2.  **`service.ts`**:
    - **Rol**: Lógica de Negocio.
    - **Responsabilidad**: Realiza la tarea real (enviar correo, generar PDF, llamar API externa). Debe ser agnóstico de Bull/Redis.
    - **Ejemplo**: `EmailService`.

3.  **`types.ts`**:
    - **Rol**: Definiciones de Tipo.
    - **Responsabilidad**: Define la interfaz del payload (los datos) que recibe el job.

4.  **`constants.ts`**:
    - **Rol**: Constantes.
    - **Responsabilidad**: Define nombres de colas o constantes específicas del dominio del job.

## `jobs.loader.ts`

Este archivo es el **orquestador central** de la carga de trabajos.

- Importa todos los procesadores.
- Obtiene las colas correspondientes desde `QueueFactory`.
- Registra cada procesador en su cola con la concurrencia definida en `ENV`.

## Cómo crear un nuevo Job

1.  Crear carpeta `src/jobs/nuevo-job/`.
2.  Definir interfaz de datos en `nuevo-job.types.ts`.
3.  Implementar lógica en `nuevo-job.service.ts`.
4.  Crear `nuevo-job.processor.ts` extendiendo `BaseProcessor<SuInterfaz>`.
5.  Registrar el nuevo processor en `src/jobs/jobs.loader.ts`.

## Ejemplo de Flujo

1.  API (Producer) agrega un trabajo a la cola `email-queue`.
2.  Worker (Consumer) detecta el trabajo mediante `jobs.loader.ts`.
3.  `QueueFactory` entrega el trabajo a `EmailProcessor`.
4.  `EmailProcessor` invoca `EmailService.send()`.
5.  Si todo sale bien, `BaseProcessor` marca el trabajo como completado.
6.  Si hay error, `BaseProcessor` lo captura, loguea y marca el trabajo como fallido.
