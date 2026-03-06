/**
 * Formatea precio para mostrar (ej. 12000 → "$12.000")
 */

/**
 * @param {number} value
 * @returns {string}
 */
export function formatPrice(value) {
  if (value == null || typeof value !== 'number') return ''
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}
