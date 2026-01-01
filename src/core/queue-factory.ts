import { defaultBullConfig } from '@config/bull.config';
import Logger from '@config/logger';
import Queue from 'bull';

/**
 * Factory para la gestión centralizada de colas Bull.
 *
 * Esta clase implementa el patrón **Singleton** para almacenar referencias a las colas creadas.
 * Esto es crucial porque Bull crea nuevas conexiones a Redis por cada instancia de cola. Reutilizar
 * las instancias previene el agotamiento de recursos y asegura que no duplicamos listeners.
 *
 * Responsabilidades:
 * 1. Crear colas con una configuración base estándar.
 * 2. Mantener un registro (cache) de las colas activas.
 * 3. Proveer un mecanismo para cerrar todas las conexiones limpiamente (Graceful Shutdown).
 */
export class QueueFactory {
  /**
   * Almacén interno estático para las instancias de colas.
   * Key: Nombre de la cola.
   * Value: Instancia de Bull.Queue.
   */
  private static queues: Map<string, Queue.Queue> = new Map();

  /**
   * Obtiene una instancia existente de una cola o crea una nueva si no existe.
   *
   * Aplica automáticamente la configuración por defecto (`defaultBullConfig`) definida en el proyecto,
   * permitiendo sobreescribirla con opciones específicas si es necesario.
   *
   * @param name - Nombre único de la cola (ej: 'email-queue').
   * @param options - (Opcional) Configuraciones adicionales de Bull que se fusionarán con la default.
   * @returns La instancia de la cola Bull lista para usar.
   */
  static getQueue(name: string, options?: Queue.QueueOptions): Queue.Queue {
    // Si la cola ya fue instanciada, retornamos la referencia en memoria
    if (this.queues.has(name)) {
      return this.queues.get(name)!;
    }

    // Fusionamos la config por defecto con las opciones específicas
    const config = { ...defaultBullConfig, ...options };
    const queue = new Queue(name, config);

    Logger.info(`Cola ${name} inicializada`);

    // Guardamos la nueva instancia en el mapa
    this.queues.set(name, queue);
    return queue;
  }

  /**
   * Cierra todas las conexiones activas a Redis de todas las colas registradas.
   *
   * Este método es fundamental para el proceso de **Graceful Shutdown**. Debe ser llamado
   * cuando la aplicación recibe señales de terminación (SIGTERM, SIGINT) para asegurar
   * que no queden trabajos a medio procesar o conexiones colgadas.
   */
  static async closeAll(): Promise<void> {
    const promises = Array.from(this.queues.values()).map((q) => q.close());
    await Promise.all(promises);

    // Limpiamos el mapa para liberar memoria
    this.queues.clear();
    Logger.info('All queues closed');
  }
}
