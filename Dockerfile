# =============================================================================
# Etapa 1: Builder
# Compila el código TypeScript y prepara los archivos para producción
# =============================================================================
FROM node:22-alpine AS builder

# Instalar dependencias del sistema necesarias para Prisma y compilación
RUN apk add --no-cache openssl git

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
RUN npm install

# Copiar el código fuente
COPY src ./src

# Generar cliente de Prisma
RUN npx prisma generate

# Compilar el proyecto (TypeScript -> JavaScript)
# Nota: Esto ejecutará "tsc && copyfiles..." definido en package.json
RUN npm run build

# =============================================================================
# Etapa 2: Runner
# Imagen ligera para ejecutar la aplicación en producción
# =============================================================================
FROM node:22-alpine AS runner

# Instalar dependencias del sistema requeridas en runtime (OpenSSL para Prisma)
RUN apk add --no-cache openssl curl

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar SOLAMENTE dependencias de producción
RUN npm install --omit=dev

# Copiar artefactos construidos desde la etapa 'builder'
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copiar carpeta prisma para migraciones/schema si es necesario
COPY --from=builder /app/prisma ./prisma

# Cambiar propietario de los archivos al usuario no-root
RUN chown -R nodejs:nodejs /app

# Cambiar al usuario no-root
USER nodejs

# Definir variables de entorno por defecto (pueden ser sobreescritas)
ENV NODE_ENV=production

# Comando de inicio del worker
CMD ["node", "dist/worker.js"]
