import Logger from '@config/logger';
import { BaseProcessor } from '@core/base.processor';
import { DoneCallback, Job } from 'bull';
import { EmailService } from './email.service';
import { EmailPayload } from './email.types';

export class EmailProcessor extends BaseProcessor<EmailPayload> {
  private emailService: EmailService;

  constructor() {
    super();
    this.emailService = new EmailService();
  }

  protected async process(
    job: Job<EmailPayload>,
    done: DoneCallback
  ): Promise<void> {
    
    Logger.info(`Iniciando procesamiento del job de email: ${job.id}`);

    const { jobUuid } = job.data;

    // Llamar al servicio de email para enviar el correo

    await this.emailService.send({ jobUuid });

    Logger.info(`Email enviado exitosamente para el job: ${job.id}`);

    // Indicar a bull proceso terminó con éxito
    done();
  }
}
