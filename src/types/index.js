/**
 * Modelos de datos para la app. Preparados para coincidir con futura API REST.
 */

/** @typedef {'f5'|'f7'|'f8'|'f9'|'f11'} MatchType */

/** @typedef {'arquero'|'defensor'|'mediocampista'|'delantero'} Position */

/** @typedef {'habilidad'|'puntualidad'|'asistencia'|'amabilidad'|'fair_play'} RatingCategory */

/**
 * @typedef {Object} Coordinates
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} avatar
 * @property {number} [age]
 * @property {Position} [position]
 * @property {Record<RatingCategory, number>} [ratings] - promedios por categoría (1-5)
 */

/**
 * @typedef {Object} Match
 * @property {string} id
 * @property {MatchType} type
 * @property {number} maxPlayers
 * @property {string[]} playerIds
 * @property {string} date - ISO date
 * @property {string} time - HH:mm
 * @property {Coordinates} location
 * @property {string} placeName
 * @property {string} [description]
 * @property {number} [price] - precio de la cancha (ej. 15000)
 * @property {number} difficulty - 1-10
 * @property {string} createdBy - userId
 * @property {string} createdAt - ISO string
 */

/**
 * @typedef {Object} Rating
 * @property {string} id
 * @property {string} fromUserId
 * @property {string} toUserId
 * @property {string} matchId
 * @property {Record<RatingCategory, number>} scores - 1-5 por categoría
 * @property {string} createdAt
 */

export const MATCH_TYPES = /** @type {const} */ ({
  f5: { label: 'Fútbol 5', maxPlayers: 10 },
  f7: { label: 'Fútbol 7', maxPlayers: 14 },
  f8: { label: 'Fútbol 8', maxPlayers: 16 },
  f9: { label: 'Fútbol 9', maxPlayers: 18 },
  f11: { label: 'Fútbol 11', maxPlayers: 22 },
})

export const POSITIONS = /** @type {const} */ ([
  'arquero',
  'defensor',
  'mediocampista',
  'delantero',
])

export const RATING_CATEGORIES = /** @type {const} */ ([
  'habilidad',
  'puntualidad',
  'asistencia',
  'amabilidad',
  'fair_play',
])
