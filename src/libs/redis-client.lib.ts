import Logger from '@config/logger';
import { redisConnection } from '@config/redis';

const logger = Logger.getLogger('redis-client.lib');

/**
 * Librería wrapper para operaciones comunes de caché en Redis.
 * Abstrae la conexión directa de ioredis para proveer métodos de alto nivel.
 */
export class RedisClientLib {
  /**
   * Guarda un valor en caché con un tiempo de expiración (TTL).
   *
   * @param key Clave de almacenamiento
   * @param value Valor a guardar (será serializado a JSON)
   * @param ttlSeconds Tiempo de vida en segundos (default 60s)
   */
  static async set(
    key: string,
    value: any,
    ttlSeconds: number = 60
  ): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await redisConnection.set(key, stringValue, 'EX', ttlSeconds);
    } catch (error) {
      logger.error(`Error guardando en Redis para la clave ${key}`, { error });
    }
  }

  /**
   * Recupera un valor de la caché.
   *
   * @param key Clave de almacenamiento
   * @returns El valor parseado o null si no existe
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisConnection.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Error obteniendo de Redis para la clave ${key}`, { error });
      return null;
    }
  }

  /**
   * Elimina una clave de la caché.
   */
  static async del(key: string): Promise<void> {
    try {
      await redisConnection.del(key);
    } catch (error) {
      logger.error(`Error eliminando de Redis para la clave ${key}`, { error });
    }
  }
}
