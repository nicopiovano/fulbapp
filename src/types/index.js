/**
 * Modelos de datos para la app. Preparados para coincidir con futura API REST.
 */

/** @typedef {'f5'|'f7'|'f8'|'f9'|'f11'} MatchType */

/** @typedef {'arquero'|'defensor'|'mediocampista'|'delantero'} Position */

/** @typedef {'habilidad'|'puntualidad'|'asistencia'|'amabilidad'|'fair_play'} RatingCategory */

/** @typedef {'cemento'|'caucho'|'sintetico'} FieldSurfaceType */

/** @typedef {'techado'|'descubierto'} EstablishmentCovered */

/** @typedef {'buffet'|'vestuario'} EstablishmentAmenity */

/** @typedef {'mixto'|'femenino'|'masculino'} MatchGender */

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
 * @property {string} [neighborhood] - barrio o zona (ej. Palermo, Caballito)
 * @property {string} [address] - dirección completa (ej. Av. Libertador 1234, Palermo)
 * @property {number} [openSlots] - cantidad de lugares a cubrir vía la app (si no viene, usar maxPlayers)
 * @property {string} [description]
 * @property {number} [price] - precio de la cancha (ej. 15000)
 * @property {number} difficulty - 1-10
 * @property {FieldSurfaceType} [fieldSurface] - tipo de cancha: cemento, caucho, sintético
 * @property {EstablishmentCovered} [establishmentCovered] - techado o descubierto
 * @property {EstablishmentAmenity[]} [establishmentAmenities] - con buffet, con vestuario
 * @property {MatchGender} [matchGender] - mixto, femenino, masculino
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

export const FIELD_SURFACE_TYPES = /** @type {const} */ ({
  cemento: { label: 'Cemento' },
  caucho: { label: 'Caucho' },
  sintetico: { label: 'Sintético' },
})

export const ESTABLISHMENT_COVERED = /** @type {const} */ ({
  techado: { label: 'Techado' },
  descubierto: { label: 'Descubierto' },
})

export const ESTABLISHMENT_AMENITIES = /** @type {const} */ ({
  buffet: { label: "Con buffet" },
  vestuario: { label: "Con vestuario" },
  parrilla: { label: "Con parrilla" },
});

export const MATCH_GENDERS = /** @type {const} */ ({
  mixto: { label: 'Mixto' },
  femenino: { label: 'Femenino' },
  masculino: { label: 'Masculino' },
})
