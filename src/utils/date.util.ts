/**
 * Utilidades para manipulación y formateo de fechas.
 */
export class DateUtil {
  /**
   * Formatea una fecha al formato ISO local (YYYY-MM-DD HH:mm:ss)
   * @param date Objeto Date
   * @returns String formateado
   */
  static toLocalISO(date: Date = new Date()): string {
    return date.toLocaleString('sv-SE', { timeZoneName: 'short' });
  }

  /**
   * Retorna una fecha futura sumando minutos.
   * @param minutes Cantidad de minutos a sumar
   * @returns Date
   */
  static addMinutes(minutes: number): Date {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60000);
  }
}
