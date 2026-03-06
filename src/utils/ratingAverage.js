/**
 * Cálculo de promedios de valoraciones. Lógica pura, reutilizable.
 */

import { RATING_CATEGORIES } from '@/types'

/**
 * @param {import('@/types').Rating[]} ratings
 * @returns {Record<import('@/types').RatingCategory, number>}
 */
export function getRatingAverages(ratings) {
  const result = /** @type {Record<string, number>} */ ({})
  for (const cat of RATING_CATEGORIES) {
    const values = ratings.map((r) => r.scores[cat]).filter((v) => typeof v === 'number')
    result[cat] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }
  return result
}

/**
 * @param {Record<string, number>} categoryAverages
 * @returns {number} Promedio global 1-5
 */
export function getOverallAverage(categoryAverages) {
  const values = Object.values(categoryAverages).filter((v) => v > 0)
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}
