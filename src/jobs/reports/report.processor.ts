import { BaseProcessor } from '@core/base.processor';
import { DoneCallback, Job } from 'bull';
import { ReportPayload, ReportService } from './report.service';

/**
 * Procesador encargado de la generación de reportes en segundo plano.
 * Maneja tareas pesadas que no deben bloquear el hilo principal.
 */
export class ReportProcessor extends BaseProcessor<ReportPayload> {
  private reportService: ReportService;

  constructor() {
    super();
    this.reportService = new ReportService();
  }

  /**
   * Ejecuta la lógica de generación reportes.
   *
   * @param job - El trabajo de Bull con los filtros y tipo de reporte.
   * @param done - Callback de finalización.
   */
  protected async process(
    job: Job<ReportPayload>,
    done: DoneCallback
  ): Promise<void> {
    await this.reportService.generate(job.data);
    done();
  }
}
