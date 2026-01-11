import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    // Buscar el último Job creado
    const lastJob = await prisma.emailJob.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { recipients: true },
    });

    if (!lastJob) {
        console.log('No se encontraron jobs.');
        return;
    }

    let output = '';
    output += `🔍 Job ID: ${lastJob.id}\n`;
    output += `📊 Status Global: ${lastJob.status}\n`;
    output += `📈 Stats: Sent=${lastJob.sentEmails}, Failed=${lastJob.failedEmails}\n`;
    output += '--- Destinatarios ---\n';
    lastJob.recipients.forEach(r => {
        output += JSON.stringify({
            email: r.email,
            name: r.name,
            status: r.status,
            error: r.error
        }, null, 2) + '\n';
    });

    fs.writeFileSync('status_report.txt', output);
    console.log('Reporte guardado en status_report.txt');

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
