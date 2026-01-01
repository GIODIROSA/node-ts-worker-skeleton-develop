import { Request, Response } from 'express';
import prisma from '../config/db/prisma';
import { emailQueue } from '../config/db/';

export const createEmailJob = async (req: Request, res: Response) => {
  try {
    const { subject, body, recipients } = req.body;

    //Validacioón
    if (
      !subject ||
      !body ||
      !recipients ||
      !Array.isArray(recipients) ||
      recipients.length === 0
    ) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }

    const newJob = await prisma.$transaction(async (tx) => {
      return await tx.emailJob.create({
        data: {
          subject,
          body,
          totalEmails: recipients.length,
          status: 'PENDING',
          recipients: {
            create: recipients.map((email: string) => ({
              email,
              status: 'PENDING',
            })),
          },
        },
      });
    });

    await emailQueue.add(`job-${newJob.id}, {jobId: newJob.id}`);

    return res
      .status(202)
      .json({ message: 'Campaña recibida', jobId: newJob.id });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
