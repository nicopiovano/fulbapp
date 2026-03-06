/**
 * Normaliza fecha a YYYY-MM-DD para parsing ISO.
 * Acepta YYYY-MM-DD o DD-MM-YYYY.
 */
function toIsoDate(dateStr) {
  const parts = String(dateStr).trim().split(/[-/]/)
  if (parts.length < 3) return null
  const [a, b, c] = parts.map(Number)
  if (!a || !b || !c) return null
  let year, month, day
  if (a > 31 || String(a).length >= 4) {
    year = a
    month = b
    day = c
  } else if (c > 31 || String(c).length >= 4) {
    year = c
    month = b
    day = a
  } else {
    return null
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Fecha "ahora" para comparar. Permite override en dev (VITE_OVERRIDE_DATE=2025-03-06). */
function getNow() {
  const override = typeof import.meta !== 'undefined' && import.meta.env?.VITE_OVERRIDE_DATE
  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) {
    return new Date(override + 'T12:00:00').getTime()
  }
  return Date.now()
}

/**
 * Determina si un partido ya finalizó.
 * Un partido se considera pasado si la fecha + hora + 2h ya ocurrió.
 * Fecha: YYYY-MM-DD o DD-MM-YYYY. Hora: HH:mm (24h).
 *
 * @param {string} date - YYYY-MM-DD o DD-MM-YYYY
 * @param {string} time - HH:mm
 * @returns {boolean}
 */
export function isMatchPast(date, time) {
  if (!date || !time || typeof date !== 'string' || typeof time !== 'string') {
    return false
  }
  try {
    const isoDate = toIsoDate(date)
    if (!isoDate) return false
    const timePart = String(time).trim().slice(0, 5)
    if (!/^\d{1,2}:\d{2}$/.test(timePart)) return false
    const [h, min] = timePart.split(':').map(Number)
    const matchEnd = new Date(`${isoDate}T${String(h || 0).padStart(2, '0')}:${String(min || 0).padStart(2, '0')}:00`)
    if (Number.isNaN(matchEnd.getTime())) return false
    matchEnd.setHours(matchEnd.getHours() + 2)
    return getNow() > matchEnd.getTime()
  } catch {
    return false
  }
}
