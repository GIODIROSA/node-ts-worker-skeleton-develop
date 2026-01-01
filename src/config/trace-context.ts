/**
 * @fileoverview Sistema de trazabilidad de requests usando AsyncLocalStorage
 *
 * Este módulo proporciona un contexto asíncrono para rastrear requests a través
 * de toda la aplicación sin necesidad de pasar el traceId explícitamente en cada
 * función. Utiliza la API AsyncLocalStorage de Node.js para mantener el contexto
 * a través de operaciones asíncronas.
 *
 * @module config/trace-context
 */

import { AsyncLocalStorage } from 'async_hooks';

/**
 * Estructura del almacenamiento de contexto de trazabilidad
 */
interface TraceStore {
  traceId: string;
}

/**
 * Instancia de AsyncLocalStorage para almacenar el contexto de trazabilidad
 */
const asyncLocalStorage = new AsyncLocalStorage<TraceStore>();

/**
 * Ejecuta una función dentro de un contexto de trazabilidad específico
 *
 * @template T - Tipo de retorno de la función
 * @param {string} traceId - Identificador único de trazabilidad
 * @param {() => T} fn - Función a ejecutar dentro del contexto
 * @returns {T} El resultado de ejecutar la función
 */
const runWithTrace = <T>(traceId: string, fn: () => T): T => {
  return asyncLocalStorage.run({ traceId }, fn);
};

/**
 * Establece el ID de traza en el contexto actual si no existe uno previo
 *
 * @param {string} traceId - Identificador único de trazabilidad a establecer
 */
const setTraceId = (traceId: string): void => {
  if (!asyncLocalStorage.getStore()) {
    asyncLocalStorage.enterWith({ traceId });
  }
};

/**
 * Obtiene el ID de traza del contexto asíncrono actual
 *
 * @returns {string | undefined} El traceId actual o undefined si no hay contexto
 */
const getTraceId = (): string | undefined => {
  const store = asyncLocalStorage.getStore();
  return store ? store.traceId : undefined;
};

export default {
  runWithTrace,
  setTraceId,
  getTraceId,
};
