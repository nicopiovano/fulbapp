/**
 * Servicio de partidos. Mock actual; reemplazar por llamadas HTTP a API REST.
 */

import { mockMatches } from '@/mock/mockMatches'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

/** @type {import('@/types').Match[]} */
let matches = [...mockMatches]

/**
 * @returns {Promise<import('@/types').Match[]>}
 */
export async function getMatches() {
  await delay()
  return [...matches]
}

/**
 * @param {string} id
 * @returns {Promise<import('@/types').Match | null>}
 */
export async function getMatchById(id) {
  await delay(150)
  return matches.find((m) => m.id === id) ?? null
}

/**
 * @param {Omit<import('@/types').Match, 'id' | 'createdAt' | 'playerIds'> & { playerIds?: string[] }} payload
 * @returns {Promise<import('@/types').Match>}
 */
export async function createMatch(payload) {
  await delay(400)
  const newMatch = {
    id: `m${Date.now()}`,
    playerIds: payload.createdBy ? [payload.createdBy] : [],
    createdAt: new Date().toISOString(),
    price: payload.price ?? null,
    ...payload,
  }
  matches.push(newMatch)
  return newMatch
}

/**
 * @param {string} matchId
 * @param {string} userId
 * @returns {Promise<import('@/types').Match>}
 */
export async function joinMatch(matchId, userId) {
  await delay(300)
  const match = matches.find((m) => m.id === matchId)
  if (!match) throw new Error('Partido no encontrado')
  if (match.playerIds.includes(userId)) throw new Error('Ya estás anotado')
  if (match.playerIds.length >= match.maxPlayers) throw new Error('Partido completo')
  match.playerIds = [...match.playerIds, userId]
  return match
}

/**
 * @param {string} matchId
 * @param {string} userId
 * @returns {Promise<import('@/types').Match>}
 */
export async function leaveMatch(matchId, userId) {
  await delay(300)
  const match = matches.find((m) => m.id === matchId)
  if (!match) throw new Error('Partido no encontrado')
  match.playerIds = match.playerIds.filter((id) => id !== userId)
  return match
}

const EDITABLE_KEYS = [
  'type', 'maxPlayers', 'date', 'time', 'placeName', 'description', 'price',
  'difficulty', 'location', 'fieldSurface', 'establishmentCovered',
  'establishmentAmenities', 'matchGender', 'neighborhood', 'address', 'openSlots',
]

/**
 * Actualiza un partido. Solo el creador puede editarlo (validado en store).
 * @param {string} matchId
 * @param {string} userId - debe ser el createdBy del partido
 * @param {Partial<import('@/types').Match>} payload - campos a actualizar
 * @returns {Promise<import('@/types').Match>}
 */
export async function updateMatch(matchId, userId, payload) {
  await delay(400)
  const match = matches.find((m) => m.id === matchId)
  if (!match) throw new Error('Partido no encontrado')
  if (match.createdBy !== userId) throw new Error('Solo el organizador puede editar el partido')
  EDITABLE_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      match[key] = payload[key]
    }
  })
  return { ...match }
}
