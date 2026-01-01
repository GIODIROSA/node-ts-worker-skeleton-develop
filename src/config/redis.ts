/**
 * @fileoverview Configuración de conexión a Redis (ioredis)
 *
 * Establece la conexión principal a Redis utilizando ioredis.
 * Esta conexión puede ser utilizada directamente para operaciones de caché
 * o propósitos generales fuera de Bull.
 *
 * @module config/redis
 */

import Redis from 'ioredis';
import { ENV } from './constants';
import Logger from './logger';

/**
 * Configuración específica para el cliente de Redis
 */
const redisConfig = {
  maxRetriesPerRequest: null, // Requerido por BullMQ/Bull en algunos contextos
  enableReadyCheck: false,
};

/**
 * Instancia del cliente de Redis (Singleton por módulo)
 *
 * @type {Redis}
 */
export const redisConnection = new Redis(ENV.REDIS_URL, redisConfig);

redisConnection.on('connect', () => {
  Logger.info('Redis connected');
});

redisConnection.on('error', (err) => {
  Logger.error('Redis error', err);
});
