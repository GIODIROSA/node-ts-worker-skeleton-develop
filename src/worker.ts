import 'module-alias/register';
import { ENV } from '@config/constants';
import Logger from '@config/logger';
import { QueueFactory } from '@core/queue-factory';
import { loadJobs } from '@jobs/jobs.loader';

/**
 * Función de arranque del Worker.
 *
 * Responsabilidades:
 * 1. **Inicialización del Entorno**: Carga configuración y loguea el estado inicial.
 * 2. **Carga de Jobs**: Delega a `loadJobs` la configuración de colas y procesadores.
 * 3. **Gestión de Errores**: Captura fallos fatales durante el inicio para evitar estados inconsistentes.
 * 4. **Graceful Shutdown**: Configura listeners para señales del SO (SIGTERM, SIGINT) para apagar limpiamente.
 */
async function bootstrap() {
  Logger.info('🚀 Worker starting...');
  Logger.info(`🌍 Environment: ${ENV.NODE_ENV}`);

  try {
    // Cargar y registrar todos los procesadores de trabajos
    await loadJobs();

    Logger.info('✅ Worker iniciado exitosamente. Esperando a los jobs...');

    /**
     * Función de limpieza para apagado ordenado.
     * Cierra todas las conexiones a Redis/Bull para evitar trabajos colgados.
     */
    const cleanup = async () => {
      Logger.info('🛑 Apagando worker...');
      await QueueFactory.closeAll();
      process.exit(0);
    };

    // Escuchar señales de terminación de Docker/Kubernetes/OS
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
  } catch (error) {
    Logger.error('❌ Worker fallido al iniciar', { error });
    process.exit(1);
  }
}

// Iniciar la aplicación
bootstrap();
