# Libs Directory

Este directorio contiene **librerías internas**, wrappers de servicios externos o clientes de API.
A diferencia de los `utils` (que son funciones puras y sin estado), las `libs` suelen implicar I/O, configuraciones de clientes, o lógica de integración más compleja.

## Convención

- Los archivos deben terminar en `.lib.ts`.
- Preferiblemente usar clases para encapsular configuraciones o clientes.

## Componentes Disponibles

### 1. `mailer.lib.ts`

Wrapper sobre `nodemailer` para el envío transaccional de correos.

**Uso:**

```typescript
import { mailerLib } from '@libs/mailer.lib';

await mailerLib.sendMail({
  to: 'usuario@dominio.com',
  subject: 'Bienvenido',
  html: '<h1>Hola!</h1>',
});
```

### 2. `redis-client.lib.ts`

Utilidad para interactuar con Redis como capa de Caché (set/get simples), abstrayendo la conexión base de ioredis.

**Uso:**

```typescript
import { RedisClientLib } from '@libs/redis-client.lib';

// Guardar en caché por 60 segundos
await RedisClientLib.set('user:123', userData, 60);

// Recuperar
const user = await RedisClientLib.get('user:123');
```

### 3. `template.lib.ts`

Motor de renderizado de plantillas HTML usando **Handlebars**.

**Uso:**

```typescript
import path from 'path';
import { templateLib } from '@libs/template.lib';

// Definir la ruta del template (idealmente dentro del módulo del job)
const templatePath = path.join(__dirname, '../templates/welcome.hbs');

// Renderiza
const html = await templateLib.render(templatePath, { name: 'Juan' });

// Usar junto con MailerLib
await mailerLib.sendMail({
  to: 'juan@test.com',
  subject: 'Bienvenido',
  html: html,
});
```
