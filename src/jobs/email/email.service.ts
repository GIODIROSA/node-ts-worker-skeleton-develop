import prisma from '@config/db/prisma';
import Logger from '@config/logger';
import { EmailPayload } from '../../interface/email/email.types';
import { Recipient } from '@prisma/client';
import nodamailer from 'nodemailer';
import { ENV } from '@config/constants';
import { templateLib } from '@libs/template.lib';
import path from 'path';

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

    // 3. Procesar envíos individualmente
    const recipients = email.recipients;
    let sentCount = 0;
    let failedCount = 0;

    logger.info(
      `Iniciando envío a ${recipients.length} destinatarios para Job ${email.id}`
    );

    for (const recipient of recipients) {
      try {
        // Compilar template personalizado
        const personalizedHtml = await templateLib.render(
          path.join(__dirname, 'templates/welcome.hbs'),
          {
            name: recipient.name || 'Usuario', // Fallback si no tiene nombre
            // Se pueden agregar más variables aquí
          }
        );

        logger.debug(
          `Enviando correo a ${recipient.email} para Job ${email.id}`
        );

        await this.transporter.sendMail({
          from: '"Worker Flagare" <no-reply@flagare.com>',
          to: recipient.email,
          subject: email.subject,
          html: personalizedHtml, // Usar el HTML compilado
        });

        // Actualizar estado del destinatario a SENT
        await prisma.recipient.update({
          where: { id: recipient.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        sentCount++;
      } catch (error: any) {
        logger.error(
          `Error enviando a ${recipient.email} (Job: ${email.id}): ${error.message}`
        );

        // Actualizar estado del destinatario a FAILED
        await prisma.recipient.update({
          where: { id: recipient.id },
          data: {
            status: 'FAILED',
            error: error.message || 'Unknown error',
          },
        });

        failedCount++;
      }

      // Rate Limiting: Esperar 1 segundo entre correos para no saturar el SMTP (Mailtrap)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 4. Finalizamos actualizando el Job con contadores y estado final
    const finalStatus =
      failedCount === recipients.length && recipients.length > 0
        ? 'FAILED'
        : 'COMPLETED';

    await prisma.emailJob.update({
      where: { id: email.id },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        sentEmails: sentCount,
        failedEmails: failedCount,
      },
    });

    Logger.info(
      `✅ Job ${data.jobUuid} finalizado. Sent: ${sentCount}, Failed: ${failedCount}`
    );
  }
}
