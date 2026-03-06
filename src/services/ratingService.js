/**
 * Servicio de valoraciones. Mock actual; reemplazar por llamadas HTTP a API REST.
 */

import { mockRatings } from '@/mock/mockRatings'
import { RATING_CATEGORIES } from '@/types'
import { getRatingAverages } from '@/utils/ratingAverage'

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

/** @type {import('@/types').Rating[]} */
let ratings = [...mockRatings]

/**
 * @param {string} toUserId
 * @returns {Promise<import('@/types').Rating[]>}
 */
export async function getRatingsForUser(toUserId) {
  await delay()
  return ratings.filter((r) => r.toUserId === toUserId)
}

/**
 * @param {string} matchId
 * @returns {Promise<import('@/types').Rating[]>}
 */
export async function getRatingsForMatch(matchId) {
  await delay()
  return ratings.filter((r) => r.matchId === matchId)
}

/**
 * @param {string} toUserId
 * @returns {Promise<Record<import('@/types').RatingCategory, number>>}
 */
export async function getRatingAveragesForUser(toUserId) {
  const userRatings = await getRatingsForUser(toUserId)
  return getRatingAverages(userRatings)
}

/**
 * @param {Object} payload
 * @param {string} payload.fromUserId
 * @param {string} payload.toUserId
 * @param {string} payload.matchId
 * @param {Record<import('@/types').RatingCategory, number>} payload.scores
 * @returns {Promise<import('@/types').Rating>}
 */
export async function ratePlayer({ fromUserId, toUserId, matchId, scores }) {
  await delay(400)
  const valid = RATING_CATEGORIES.every(
    (cat) => typeof scores[cat] === 'number' && scores[cat] >= 1 && scores[cat] <= 5
  )
  if (!valid) throw new Error('Scores inválidos (1-5 por categoría)')
  const newRating = {
    id: `r${Date.now()}`,
    fromUserId,
    toUserId,
    matchId,
    scores: { ...scores },
    createdAt: new Date().toISOString(),
  }
  ratings.push(newRating)
  return newRating
}
