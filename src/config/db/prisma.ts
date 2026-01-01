/**
 * @fileoverview Cliente Prisma singleton para gestión de base de datos
 *
 * Este módulo proporciona una instancia única (singleton) del cliente de Prisma
 * para toda la aplicación, evitando múltiples conexiones innecesarias y mejorando
 * el rendimiento. Incluye integración con el sistema de logging de Winston.
 *
 * @module config/db/prisma
 *
 * @description
 * Características principales:
 * - Patrón singleton para una única instancia del cliente
 * - Integración con Winston para logging de queries y errores
 * - Configuración de nivel de log mediante variables de entorno
 * - Soporte para hot-reloading en desarrollo sin duplicar conexiones
 * - Funciones helper para conectar/desconectar de la base de datos
 *
 * @example
 * ```typescript
 * import prisma from './config/db/prisma';
 *
 * // Usar el cliente en cualquier parte de la aplicación
 * const users = await prisma.user.findMany();
 * ```
 *
 * @requires @prisma/client - Cliente ORM de Prisma
 * @requires ../logger - Sistema de logging de Winston
 * @requires ../constants - Variables de entorno
 */

import { PrismaClient } from '@prisma/client';
import { ENV } from '../constants';
import Logger from '../logger';

/**
 * Instancia del logger específica para operaciones de Prisma
 * Usa el contexto 'prisma' para identificar logs relacionados con la base de datos
 */
const logger = new Logger('prisma');

/**
 * Extensión del tipo global de NodeJS para incluir el cliente de Prisma
 * Esto permite almacenar la instancia en el objeto global para evitar
 * múltiples instancias durante hot-reloading en desarrollo
 *
 * @global
 */
declare global {
  // Usar 'var' es necesario para declaraciones globales en TypeScript
  // eslint-disable-next-line no-var, @typescript-eslint/no-redundant-type-constituents
  var prisma: PrismaClient | undefined;
}

/**
 * Tipo para los niveles de log soportados por Prisma
 */
type PrismaLogLevel = 'info' | 'query' | 'warn' | 'error';

/**
 * Tipo para la configuración de log de Prisma
 * Usa el tipo oficial de Prisma para garantizar compatibilidad
 */
type PrismaLogDefinition = {
  emit: 'event';
  level: PrismaLogLevel;
};

/**
 * Tipo para eventos de query de Prisma
 */
type PrismaQueryEvent = {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
};

/**
 * Tipo para eventos de log de Prisma (info, warn, error)
 */
type PrismaLogEvent = {
  timestamp: Date;
  message: string;
  target: string;
};

/**
 * Parsea la configuración de niveles de log de Prisma desde variable de entorno
 *
 * Convierte una cadena separada por comas (ej: 'query,error,warn') en un array
 * de objetos de configuración de log que Prisma puede usar.
 *
 * @returns {Array<PrismaLogDefinition>} Array de configuraciones de log para Prisma
 *
 * @example
 * ```typescript
 * // Si PRISMA_LOG_LEVEL='query,error'
 * // Retorna: [{ emit: 'event', level: 'query' }, { emit: 'event', level: 'error' }]
 * ```
 */
const parsePrismaLogLevels = (): Array<PrismaLogDefinition> => {
  const logLevels = ENV.PRISMA_LOG_LEVEL.split(',').map((level) =>
    level.trim()
  ) as Array<PrismaLogLevel>;

  return logLevels.map((level) => ({
    emit: 'event' as const,
    level,
  }));
};

/**
 * Crea una instancia única del cliente de Prisma con configuración personalizada
 *
 * Configura el cliente con:
 * - Niveles de log basados en variables de entorno
 * - Event listeners para redirigir logs a Winston
 * - Logging condicional de queries según el ambiente
 *
 * @returns {PrismaClient} Instancia configurada del cliente de Prisma
 *
 * @private
 */
const prismaClientSingleton = (): PrismaClient => {
  const logLevels = parsePrismaLogLevels();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const client = new PrismaClient({
    log: logLevels,
  });

  // Suscribirse a los eventos de Prisma y redirigirlos al logger de Winston
  // Solo registrar queries en ambientes no productivos para evitar logs excesivos
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  client.$on('query', (e: PrismaQueryEvent) => {
    if (ENV.NODE_ENV !== 'prd') {
      logger.debug(
        `[Prisma Query] ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`
      );
    }
  });

  // Registrar errores de Prisma con nivel error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  client.$on('error', (e: PrismaLogEvent) => {
    logger.error(`[Prisma Error] ${e.message}`);
  });

  // Registrar advertencias de Prisma
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  client.$on('warn', (e: PrismaLogEvent) => {
    logger.warn(`[Prisma Warning] ${e.message}`);
  });

  // Registrar información general de Prisma
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  client.$on('info', (e: PrismaLogEvent) => {
    logger.info(`[Prisma Info] ${e.message}`);
  });

  return client;
};

/**
 * Instancia singleton del cliente de Prisma
 *
 * En desarrollo, se almacena en el objeto global para evitar crear múltiples
 * instancias durante el hot-reloading. En producción, se crea una nueva instancia.
 *
 * @constant
 * @type {PrismaClient}
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const prisma = global.prisma ?? prismaClientSingleton();

// Almacenar en global solo en ambientes no productivos para soportar hot-reloading
if (ENV.NODE_ENV !== 'prd') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  global.prisma = prisma;
}

/**
 * Conecta explícitamente a la base de datos
 *
 * Establece una conexión con la base de datos y verifica que sea exitosa.
 * Útil para verificar la conectividad al iniciar la aplicación o en health checks.
 *
 * **Nota:** Prisma se conecta automáticamente en la primera query, por lo que
 * esta función es opcional pero recomendada para validación temprana.
 *
 * @returns {Promise<void>} Promise que se resuelve cuando la conexión es exitosa
 * @throws {Error} Si la conexión falla
 *
 * @example
 * ```typescript
 * import { connectDatabase } from './config/db/prisma';
 *
 * // Al iniciar la aplicación
 * await connectDatabase();
 * console.log('Base de datos lista');
 * ```
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await prisma.$connect();
    logger.info('✅ Conexión a la base de datos establecida correctamente');
  } catch (error: unknown) {
    logger.error('❌ Error al conectar a la base de datos:', error);
    throw error;
  }
};

/**
 * Desconecta de la base de datos de forma limpia
 *
 * Cierra todas las conexiones activas del pool de Prisma. Importante llamar
 * esta función al detener la aplicación para evitar conexiones colgadas.
 *
 * @returns {Promise<void>} Promise que se resuelve cuando la desconexión es exitosa
 * @throws {Error} Si la desconexión falla
 *
 * @example
 * ```typescript
 * import { disconnectDatabase } from './config/db/prisma';
 *
 * // Al detener la aplicación (ej: en un handler de SIGTERM)
 * process.on('SIGTERM', async () => {
 *   await disconnectDatabase();
 *   process.exit(0);
 * });
 * ```
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await prisma.$disconnect();
    logger.info('🔌 Desconectado de la base de datos');
  } catch (error: unknown) {
    logger.error('❌ Error al desconectar de la base de datos:', error);
    throw error;
  }
};

/**
 * Exportación por defecto del cliente Prisma singleton
 *
 * Esta es la instancia principal que debe usarse en toda la aplicación
 * para interactuar con la base de datos.
 *
 * @exports prisma
 * @type {PrismaClient}
 *
 * @example
 * ```typescript
 * import prisma from './config/db/prisma';
 *
 * // Operaciones CRUD
 * const user = await prisma.user.create({
 *   data: { email: 'user@example.com', name: 'John' }
 * });
 *
 * const users = await prisma.user.findMany();
 * ```
 */
export default prisma;
