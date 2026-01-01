import prisma from '@config/db/prisma';
import Logger from '@config/logger';
import { EmailPayload } from './email.types';

/**
 * Servicio de dominio para el envío de correos electrónicos.
 * Contiene la lógica de negocio pura, desacoplada de la infraestructura de colas.
 */
export class EmailService {
  /**
   * Ejecuta el flujo de envío de correo electrónico.
   *
   * 1. Recupera el registro del Job desde la base de datos usando `jobUuid`.
   * 2. Actualiza el estado a PROCESSING.
   * 3. (Pendiente) Envía el correo usando MailerLib.
   * 4. Actualiza el estado a COMPLETED.
   *
   * @param data - Payload del job conteniendo el UUID del registro en BD.
   * @returns Promesa que se resuelve al completar el flujo.
   */
  async send(data: EmailPayload): Promise<void> {
    const email = await prisma.emailJob.findUnique({
      where: {
        id: data.jobUuid,
      },
    });

    if (!email) {
      throw new Error('Email no encontrado');
    }

    await prisma.emailJob.update({
      where: {
        id: email.id,
      },
      data: {
        status: prisma.emailJobStatus.PROCESSING,
      },
    });

    const recipients = email.recipients as string[];
    Logger.info(
      `Enviando email a ${recipients.join(', ')} con asunto "${email.subject}"`
    );

    await prisma.emailJob.update({
      where: {
        id: email.id,
      },
      data: {
        status: prisma.emailJobStatus.COMPLETED,
      },
    });
  }
}
