/**
 * Formatea fecha para mostrar de forma contextual.
 * - Hoy → "Hoy"
 * - Mañana → "Mañana"
 * - Misma semana → día de la semana (domingo, lunes...)
 * - Otra semana → día de la semana + número del mes (ej. "lunes 10" o "lunes 10 Mar")
 */

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function getStartOfWeek(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // lunes como inicio
  return new Date(date.setDate(diff))
}

function isSameWeek(d1, d2) {
  const start1 = getStartOfWeek(new Date(d1))
  const start2 = getStartOfWeek(new Date(d2))
  return start1.getTime() === start2.getTime()
}

function isToday(d) {
  const today = new Date()
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
}

function isTomorrow(d) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
}

/**
 * @param {string} date - YYYY-MM-DD
 * @param {string} [time] - HH:mm
 * @returns {string}
 */
export function formatMatchDate(date, time) {
  if (!date) return '—'
  const [y, m, d] = date.split('-').map(Number)
  const matchDate = new Date(y, (m || 1) - 1, d || 1)
  const today = new Date()

  let label
  if (isToday(matchDate)) {
    label = 'Hoy'
  } else if (isTomorrow(matchDate)) {
    label = 'Mañana'
  } else if (isSameWeek(matchDate, today)) {
    label = DIAS[matchDate.getDay()]
  } else {
    const diaNum = matchDate.getDate()
    const mes = MESES[matchDate.getMonth()]
    const diaNombre = DIAS[matchDate.getDay()]
    label = today.getMonth() === matchDate.getMonth()
      ? `${diaNombre} ${diaNum}`
      : `${diaNombre} ${diaNum} ${mes}`
  }

  return time ? `${label} · ${time}` : label
}

/**
 * Formato completo para el detalle: "viernes 15 de marzo · 18:00"
 * @param {string} date - YYYY-MM-DD
 * @param {string} [time] - HH:mm
 * @returns {string}
 */
export function formatMatchDateFull(date, time) {
  if (!date) return '—'
  const [y, m, d] = date.split('-').map(Number)
  const matchDate = new Date(y, (m || 1) - 1, d || 1)
  const diaNombre = DIAS[matchDate.getDay()]
  const diaNum = matchDate.getDate()
  const mes = MESES[matchDate.getMonth()]
  const base = `${diaNombre} ${diaNum} de ${mes}`
  return time ? `${base} · ${time}` : base
}
