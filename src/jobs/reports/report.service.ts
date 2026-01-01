import Logger from '@config/logger';

/**
 * Interfaz que define la estructura de datos requerida para generar un reporte.
 */
export interface ReportPayload {
  reportId: string;
  type: 'daily' | 'monthly';
  filters: Record<string, any>;
}

/**
 * Servicio de dominio para la generación de reportes.
 */
export class ReportService {
  /**
   * Simula la generación de un reporte (operación intensiva en CPU/IO).
   *
   * @param data - Configuración del reporte a generar.
   */
  async generate(data: ReportPayload): Promise<void> {
    Logger.info(`Generando reporte ${data.type} con ID ${data.reportId}...`);
    return new Promise((resolve) => {
      setTimeout(() => {
        Logger.info(`Reporte ${data.reportId} generado`);
        resolve();
      }, 2000);
    });
  }
}
