import { ENV } from '@config/constants';
import Logger from '@config/logger';
import { QueueFactory } from '@core/queue-factory';
import { EmailProcessor } from './email/email.processor';
import { ReportProcessor } from './reports/report.processor';

/**
 * Carga e inicializa todas las colas y procesadores del sistema.
 *
 * Esta función es el punto central donde se "cablean" los workers:
 * 1. Obtiene las instancias de las colas (creadas o cacheadas por QueueFactory).
 * 2. Instancia los procesadores de cada módulo.
 * 3. Asocia (bind) la lógica de procesamiento a la cola correspondiente,
 *    definiendo también la concurrencia.
 */
export const loadJobs = async (): Promise<void> => {
  Logger.info('🔄 Se cargan todos los jobs...');

  // 1. Inicialización de colas
  const emailQueue = QueueFactory.getQueue(ENV.QUEUE_NAMES.EMAIL);
  const reportsQueue = QueueFactory.getQueue(ENV.QUEUE_NAMES.REPORTS);

  // 2. Registro de Procesadores

  // Email Job: Alta prioridad, mayor concurrencia general
  emailQueue.process(
    ENV.CONCURRENCY.EMAIL,
    new EmailProcessor().getProcessor()
  );
  Logger.info(
    `✅ Se registro el EmailProcessor con concurrencia ${ENV.CONCURRENCY.EMAIL}`
  );

  // Reports Job: Tareas pesadas, menor concurrencia para proteger CPU
  reportsQueue.process(
    ENV.CONCURRENCY.REPORTS,
    new ReportProcessor().getProcessor()
  );
  Logger.info(
    `✅ Se registro el ReportProcessor con concurrencia ${ENV.CONCURRENCY.REPORTS}`
  );

  Logger.info('🎉 Se cargaron todos los jobs');
};
