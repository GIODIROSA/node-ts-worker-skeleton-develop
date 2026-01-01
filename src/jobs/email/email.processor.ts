import Logger from '@config/logger';
import { BaseProcessor } from '@core/base.processor';
import { DoneCallback, Job } from 'bull';
import { EmailService } from './email.service';
import { EmailPayload } from './email.types';

/**
 * Procesador encargado de gestionar los trabajos de envío de correos.
 * Actúa como intermediario entre la cola de Bull y el servicio de dominio de emails.
 */
export class EmailProcessor extends BaseProcessor<EmailPayload> {
  private emailService: EmailService;

  constructor() {
    super();
    this.emailService = new EmailService();
  }

  /**
   * Ejecuta la lógica de procesamiento para un job de email.
   *
   * @param job - El trabajo de Bull que contiene el payload del email.
   * @param done - Callback para notificar la finalización.
   */
  protected async process(
    job: Job<EmailPayload>,
    done: DoneCallback
  ): Promise<void> {
    try {
      Logger.info('Procesando email job');
      await this.emailService.send(job.data);
      done();
    } catch (error) {
      Logger.error('Error procesando email job', { error });
      done(error as Error);
    }
  }
}
