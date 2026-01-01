/**
 * @fileoverview Configuración por defecto para colas Bull
 *
 * Este archivo define las opciones base que se aplicarán a todas las colas
 * creadas en el sistema, asegurando consistencia en la conexión a Redis
 * y en el comportamiento de reintentos y limpieza de trabajos.
 *
 * @module config/bull.config
 */

import { QueueOptions } from 'bull';
import { ENV } from './constants';

/**
 * Opciones de configuración por defecto para instancias de Bull
 *
 * @constant
 * @type {QueueOptions}
 *
 * @property {string} redis - URL de conexión a Redis
 * @property {object} defaultJobOptions - Configuración por defecto para los trabajos
 * @property {number} defaultJobOptions.attempts - Número de reintentos (3)
 * @property {object} defaultJobOptions.backoff - Estrategia de espera entre reintentos
 * @property {string} defaultJobOptions.backoff.type - Tipo de backoff ('exponential')
 * @property {number} defaultJobOptions.backoff.delay - Retraso base en ms (1000)
 * @property {boolean} defaultJobOptions.removeOnComplete - Eliminar trabajos completados (true)
 * @property {boolean} defaultJobOptions.removeOnFail - Mantener trabajos fallidos para debug (false)
 */
export const defaultBullConfig: QueueOptions = {
  redis: ENV.REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};
