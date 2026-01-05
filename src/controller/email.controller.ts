import { Request, Response } from 'express';
import prisma from '@config/db/prisma';
import { QueueFactory } from '@core/queue-factory'; 
import { ENV } from '@config/constants'; 
import Logger from '@config/logger';

export const createEmailJob = async (req: Request, res: Response) => {
  try {
    const { subject, body, recipients } = req.body;

    // 1. Validación de entrada 
    if (
      !subject ||
      !body ||
      !recipients ||
      !Array.isArray(recipients) ||
      recipients.length === 0
    ) {
      return res.status(400).json({ message: 'Datos inválidos o lista de destinatarios vacía' });
    }

    // 2. Persistencia en base de datos mediante Transacción 
    const newJob = await prisma.$transaction(async (tx) => {
      return await tx.emailJob.create({
        data: {
          subject,
          body,
          totalEmails: recipients.length,
          status: 'PENDING', // Estado inicial según el schema 
          recipients: {
            create: recipients.map((email: string) => ({
              email,
              status: 'PENDING',
            })),
          },
        },
      });
    });

    // 3. Obtener la cola y añadir el trabajo a Redis 
    const emailQueue = QueueFactory.getQueue(ENV.QUEUE_NAMES.EMAIL);


    await emailQueue.add(
      'send-email-job', 
      { jobUuid: newJob.id } 
    );

    Logger.info(`[EmailController] Job ${newJob.id} creado y encolado correctamente`);

    return res.status(202).json({ 
      message: 'Campaña recibida y en proceso', 
      jobUuid: newJob.id 
    });

  } catch (error: any) {
    Logger.error(`[EmailController] Error al crear el job: ${error.message}`);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};