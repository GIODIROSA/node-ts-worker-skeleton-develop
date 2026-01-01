# Utils Directory

Este directorio contiene **utilidades puras** y helpers reutilizables.
Las funciones aquí deben ser stateless (sin estado), deterministas y no depender de servicios externos (bases de datos, APIs).

## Convención

- Los archivos deben terminar en `.util.ts`.
- Usar clases estáticas o exportar funciones individuales.

## Componentes Disponibles

### 1. `date.util.ts`

Helpers para formateo y manipulación de fechas.

**Uso:**

```typescript
import { DateUtil } from '@utils/date.util';

const fechaFormateada = DateUtil.toLocalISO(new Date());
// output: "2024-05-20 15:30:00 GMT-4"

const enCincoMinutos = DateUtil.addMinutes(5);
```

## Cuándo crear un Util vs un Lib

| Característica     | Utils (`src/utils`)                          | Libs (`src/libs`)                      |
| ------------------ | -------------------------------------------- | -------------------------------------- |
| **Dependencias**   | Ninguna o librerías de ayuda (lodash, dayjs) | Clientes DB, APIs, AWS SDK, Nodemailer |
| **IO (Red/Disco)** | No (CPU bound)                               | Sí (I/O bound)                         |
| **Complejidad**    | Baja / Transformación de datos               | Media / Alta / Integración             |
