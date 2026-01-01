import Logger from '@config/logger';
import traceContext from '@config/trace-context';
import { DoneCallback, Job } from 'bull';

/**
 * Clase abstracta base para procesadores de trabajos (jobs)
 *
 * Estandariza la ejecución, logging y manejo de errores de los jobs.
 * Implementa trace context para seguimiento de logs por Job ID.
 *
 * @template T Tipo de datos del payload del job
 */
export abstract class BaseProcessor<T> {
  /**
   * Método abstracto que debe implementar la lógica específica del job.
   *
   * @param job El objeto Job de Bull que contiene los datos (job.data).
   * @param done Callback que DEBE ser invocado para señalar a Bull el resultado del job:
   *             - done(): Indica éxito. El job se mueve a 'completed'.
   *             - done(error): Indica fallo. El job se mueve a 'failed' y puede reintentarse según configuración.
   */
  protected abstract process(job: Job<T>, done: DoneCallback): Promise<void>;

  /**
   * Retorna la función procesadora compatible con Bull.
   *
   * Este método actúa como un "wrapper" o envoltorio alrededor de la lógica del negocio (`process`).
   * Sus responsabilidades son:
   * 1. **Inicializar Trace Context**: Asigna el Job ID como traceId para que todos los logs compartan este identificador.
   * 2. **Logging Estándar**: Registra automáticamente el inicio, fin y duración del job.
   * 3. **Manejo de Errores**: Captura excepciones no controladas y asegura que se llame a `done(error)` para no dejar jobs colgados.
   *
   * @returns Función de procesamiento (ProcessCallbackFunction) que espera Bull.
   */
  public getProcessor() {
    // Esta función anónima es la que realmente ejecuta Bull por cada trabajo
    return async (job: Job<T>, done: DoneCallback) => {
      const jobId = String(job.id);

      // Ejecutamos todo dentro de un contexto de traza para logging coherente
      traceContext.runWithTrace(jobId, async () => {
        const start = Date.now();

        // Log automático de inicio
        Logger.info({
          message: `Starting job ${jobId}`,
          queue: job.queue.name,
          data: job.data,
        });

        try {
          // Delegamos la ejecución a la implementación concreta del procesador
          await this.process(job, done);

          const duration = Date.now() - start;
          Logger.info(`Job ${jobId} completed in ${duration}ms`);
        } catch (error) {
          // Captura de errores no controlados (defensive programming)
          const duration = Date.now() - start;
          Logger.error(`Job ${jobId} failed after ${duration}ms`, { error });

          // Importante: Avisar a Bull que el job falló
          done(error as Error);
        }
      });
    };
  }
}
