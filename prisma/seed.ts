import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando el seeding...')

  // Limpiar datos previos (Opcional, pero recomendado para pruebas)
  await prisma.recipient.deleteMany()
  await prisma.emailJob.deleteMany()

  // 1. Crear un EmailJob (La campaña)
  const job = await prisma.emailJob.create({
    data: {
      subject: '¡Bienvenido al Flagare Dev Challenge!',
      body: '<h1>Hola</h1><p>Este es un correo de prueba masivo.</p>',
      status: 'PENDING',
      totalEmails: 5,
      // 2. Crear los destinatarios asociados de una vez
      recipients: {
        create: [
          { email: 'user1@example.com', status: 'PENDING' },
          { email: 'user2@example.com', status: 'PENDING' },
          { email: 'user3@example.com', status: 'PENDING' },
          { email: 'user4@example.com', status: 'PENDING' },
          { email: 'user5@example.com', status: 'PENDING' },
        ],
      },
    },
  })

  console.log(`✅ Seed finalizado. Se creó el Job con ID: ${job.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })