/**
 * @fileoverview Definición de constantes y variables de entorno
 *
 * Centraliza el acceso a las variables de entorno (.env) y define
 * constantes globales utilizadas en toda la aplicación.
 *
 * @module config/constants
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Objeto global de configuración del entorno
 *
 * @constant
 */
export const ENV = {
  /** Entorno de ejecución (development, production, test) */
  NODE_ENV: process.env.NODE_ENV || 'development',

  /** URL de conexión a Redis (ej: redis://localhost:6379) */
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  /** Nivel mínimo de logging (info, debug, error) */
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  /** URL de conexión a la base de datos (ej: postgres://user:pass@localhost:5432/db) */
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'mysql://root:password@localhost:3306/worker_db',

  /** Nivel mínimo de logging de Prisma (info, query, warn, error) */
  PRISMA_LOG_LEVEL: process.env.PRISMA_LOG_LEVEL || 'info',

  RUN_SEED: process.env.RUN_SEED || false,

  /** Nombres de las colas utilizadas en el sistema */
  QUEUE_NAMES: {
    EMAIL: process.env.QUEUE_NAME_EMAIL || 'email-queue',
    REPORTS: process.env.QUEUE_NAME_REPORTS || 'reports-queue',
  },

  /** Configuración de concurrencia por cola */
  CONCURRENCY: {
    EMAIL: parseInt(process.env.EMAIL_CONCURRENCY || '5', 10),
    REPORTS: parseInt(process.env.REPORTS_CONCURRENCY || '2', 10),
  },

  /** Ruta donde se guardarán los archivos de log */
  LOG_PATH: process.env.LOG_PATH || 'logs',

  /** Nombre base para los archivos de log */
  LOG_NAME: process.env.LOG_NAME || 'worker',

  /** Configuración del servidor SMTP para envío de correos */
  SMTP: {
    HOST: process.env.SMTP_HOST || 'smtp.example.com',
    PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    USER: process.env.SMTP_USER || 'user',
    PASS: process.env.SMTP_PASS || 'pass',
  },
};
