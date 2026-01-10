import prisma from '@config/db/prisma';
import Logger from '@config/logger';
import { EmailPayload } from '../../interface/email/email.types';
import { Recipient } from '@prisma/client';
import nodamailer from 'nodemailer';
import { ENV } from '@config/constants';

const logger = new Logger('EmailService');

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodamailer.createTransport({
      host: ENV.SMTP.HOST,
      port: ENV.SMTP.PORT,
      auth: {
        user: ENV.SMTP.USER,
        pass: ENV.SMTP.PASS,
      },
    });
  }

  async send(data: EmailPayload): Promise<void> {
    logger.debug(
      `[EmailService] Iniciando procesamiento de JOB UUID: ${data.jobUuid}`
    );

    // 1. Buscar el Job e incluimos los destinatarios
    const email = await prisma.emailJob.findUnique({
      where: {
        id: data.jobUuid,
      },
      include: {
        recipients: true,
      },
    });

    if (!email) {
      logger.error(
        `[EmailService] Intento de procesar Job inexistente ${data.jobUuid}`
      );
      throw new Error('Email no encontrado');
    }

    // 2. Actualizamos el estado a PROCESSING
    await prisma.emailJob.update({
      where: { id: email.id },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    });

    // 3. Mapear los destinatarios
    const recipientList = email.recipients.map((r: Recipient) => r.email);

    logger.info(
      `Enviando email a ${recipientList.join(', ')} con asunto "${email.subject}"`
    );

    await this.transporter.sendMail({
      from: '"Worker Flagare" <no-reply@flagare.com>',
      to: recipientList.join(', '),
      subject: email.subject,
      html: email.body,
    });

    Logger.info(`✅ Correo entregado a Mailtrap para el Job: ${data.jobUuid}`)

    // 4. Finalizamos actualizando a COMPLETED
    await prisma.emailJob.update({
      where: { id: email.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }
}
