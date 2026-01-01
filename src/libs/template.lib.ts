import Logger from '@config/logger';
import fs from 'fs/promises';
import handlebars from 'handlebars';

const logger = Logger.getLogger('TemplateLib');

/**
 * Librería para la gestión y compilación de templates HTML.
 * Utiliza Handlebars como motor de plantillas.
 */
export class TemplateLib {
  /**
   * Carga un archivo de template (.hbs) desde una ruta específica,
   * lo compila e interpola las variables.
   *
   * @param templatePath Ruta absoluta o relativa al archivo .hbs (incluyendo extensión)
   * @param context Objeto con las variables a reemplazar en el template
   * @returns String con el HTML resultante
   */
  async render(
    templatePath: string,
    context: Record<string, any>
  ): Promise<string> {
    try {
      // Leer el archivo
      const source = await fs.readFile(templatePath, 'utf-8');

      // Compilar
      const template = handlebars.compile(source);

      // Ejecutar con datos
      return template(context);
    } catch (error) {
      logger.error(`Error renderizando template en ${templatePath}`, { error });
      throw error;
    }
  }
}

export const templateLib = new TemplateLib();
