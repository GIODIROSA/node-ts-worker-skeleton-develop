import { PrismaClient } from '@prisma/client';
import Queue from 'bull';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env en la raíz
dotenv.config({ path: path.join(__dirname, '../.env') });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_NAME_EMAIL = process.env.QUEUE_NAME_EMAIL || 'email-queue';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando script de prueba...');
    console.log(`🔌 Conectando a Redis: ${REDIS_URL}`);
    console.log(`📨 Cola: ${QUEUE_NAME_EMAIL}`);

    // 1. Crear Job en DB
    const emailJob = await prisma.emailJob.create({
        data: {
            subject: 'Test Campaign from Script',
            body: '<h1>Hello World</h1><p>This is a test email.</p>',
            totalEmails: 2,
            status: 'PENDING',
            recipients: {
                create: [
                    { email: 'test1@example.com', name: 'Giovanni' },
                    { email: 'test2@example.com', name: 'Ana' },
                ],
            },
        },
        include: {
            recipients: true,
        },
    });

    console.log(`✅ Job creado en DB con ID: ${emailJob.id}`);
    console.log(`   - Destinatarios: ${emailJob.recipients.length}`);

    // 2. Encolar Job en Redis
    const emailQueue = new Queue(QUEUE_NAME_EMAIL, REDIS_URL);

    await emailQueue.add(
        {
            jobUuid: emailJob.id,
        },
        {
            attempts: 3,
        }
    );

    console.log(`✅ Job encolado en Redis en la cola: ${QUEUE_NAME_EMAIL}`);

    await emailQueue.close();
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
