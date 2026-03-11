/**
 * Servicio de partidos.
 * Con VITE_USE_MOCK=true usa datos en memoria (sin backend).
 * Con VITE_USE_MOCK=false (default) usa la API REST.
 */

import { api } from '@/services/api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ─── Normalización backend → frontend ───────────────────────────────────────

function normalizePlayer(raw) {
  if (!raw) return null
  return {
    id: String(raw.id),
    name: raw.name,
    avatar: raw.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${raw.id}`,
    age: raw.age ?? null,
    position: raw.position ?? null,
    ratings: null,
  }
}

function normalizeMatch(raw) {
  if (!raw) {
    throw new Error('Match vacío o inválido recibido desde la API')
  }
  const players = (raw.players ?? []).map(normalizePlayer).filter(Boolean)
  return {
    id: String(raw.id),
    type: raw.pitch_type,
    maxPlayers: raw.players_count,
    openSlots: raw.open_slots ?? null,
    players,
    playerIds: players.map((p) => p.id),
    date: raw.date ? raw.date.split('T')[0] : raw.date,
    time: raw.time ? raw.time.substring(0, 5) : raw.time,
    location:
      raw.lat != null && raw.lng != null
        ? { lat: Number(raw.lat), lng: Number(raw.lng) }
        : null,
    placeName: raw.venue_name,
    neighborhood: raw.neighborhood ?? null,
    address: raw.address,
    description: raw.description ?? null,
    price: raw.price != null ? Number(raw.price) : null,
    difficulty: raw.football_level,
    fieldSurface: raw.field_surface ?? null,
    establishmentCovered: raw.establishment_covered ?? null,
    establishmentAmenities: raw.establishment_amenities ?? [],
    matchGender: raw.gender ?? null,
    cancelled: raw.status?.name === 'cancelled',
    createdBy: String(raw.created_by),
    isCreator: raw.is_creator ?? false,
    createdAt: raw.created_at,
  }
}

// ─── Normalización frontend → backend ───────────────────────────────────────

function denormalizeMatch(payload) {
  const out = {}

  if (payload.type !== undefined)                    out.pitch_type              = payload.type
  if (payload.maxPlayers !== undefined)              out.players_count           = payload.maxPlayers
  if (payload.openSlots !== undefined)               out.open_slots              = payload.openSlots
  if (payload.date !== undefined)                    out.date                    = payload.date
  if (payload.time !== undefined)                    out.time                    = payload.time
  if (payload.placeName !== undefined)               out.venue_name              = payload.placeName
  if (payload.neighborhood !== undefined)            out.neighborhood            = payload.neighborhood
  if (payload.address !== undefined)                 out.address                 = payload.address
  if (payload.location !== undefined) {
    out.lat = payload.location?.lat ?? null
    out.lng = payload.location?.lng ?? null
    if (payload.address === undefined && payload.location?.label) {
      out.address = payload.location.label
    }
  }
  if (payload.address !== undefined)                 out.address                 = payload.address
  if (payload.difficulty !== undefined)              out.football_level          = payload.difficulty
  if (payload.price !== undefined)                   out.price                   = payload.price
  if (payload.matchGender !== undefined)             out.gender                  = payload.matchGender
  if (payload.fieldSurface !== undefined)            out.field_surface           = payload.fieldSurface
  if (payload.establishmentCovered !== undefined)    out.establishment_covered   = payload.establishmentCovered
  if (payload.establishmentAmenities !== undefined)  out.establishment_amenities = payload.establishmentAmenities
  if (payload.description !== undefined)             out.description             = payload.description

  return out
}

// ─── Implementación MOCK ─────────────────────────────────────────────────────

let _mockImport = null
async function getMockData() {
  if (!_mockImport) {
    const [{ mockMatches }, { mockUsers }] = await Promise.all([
      import('@/mock/mockMatches'),
      import('@/mock/mockUsers'),
    ])
    // Clonar para no mutar los originales entre recargas de HMR
    _mockImport = {
      matches: mockMatches.map((m) => ({ ...m, playerIds: [...(m.playerIds ?? [])] })),
      users: mockUsers,
    }
  }
  return _mockImport
}

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem('fulbapp_mock_user')
    return raw ? JSON.parse(raw)?.id ?? 'mock-current' : 'mock-current'
  } catch {
    return 'mock-current'
  }
}

const mockApi = {
  async getMatches() {
    const { matches } = await getMockData()
    return matches
  },

  async getMatchById(id) {
    const { matches } = await getMockData()
    return matches.find((m) => m.id === id) ?? null
  },

  async createMatch(payload) {
    const { matches } = await getMockData()
    const newMatch = {
      ...payload,
      id: `mock-${Date.now()}`,
      playerIds: [getCurrentUserId()],
      createdBy: getCurrentUserId(),
      createdAt: new Date().toISOString(),
      cancelled: false,
    }
    matches.push(newMatch)
    return newMatch
  },

  async joinMatch(matchId) {
    const { matches } = await getMockData()
    const match = matches.find((m) => m.id === matchId)
    if (!match) throw new Error('Partido no encontrado')
    const uid = getCurrentUserId()
    if (!match.playerIds.includes(uid)) match.playerIds.push(uid)
    return match
  },

  async leaveMatch(matchId) {
    const { matches } = await getMockData()
    const match = matches.find((m) => m.id === matchId)
    if (!match) throw new Error('Partido no encontrado')
    const uid = getCurrentUserId()
    match.playerIds = match.playerIds.filter((id) => id !== uid)
    return match
  },

  async cancelMatch(matchId) {
    const { matches } = await getMockData()
    const match = matches.find((m) => m.id === matchId)
    if (!match) throw new Error('Partido no encontrado')
    match.cancelled = true
    return match
  },

  async updateMatch(matchId, payload) {
    const { matches } = await getMockData()
    const idx = matches.findIndex((m) => m.id === matchId)
    if (idx === -1) throw new Error('Partido no encontrado')
    matches[idx] = { ...matches[idx], ...payload }
    return matches[idx]
  },
}

// ─── Implementación API REAL ─────────────────────────────────────────────────

function unwrapMatchResponse(response) {
  // Los endpoints de Laravel devuelven Resource/ResourceCollection:
  // - listado: { data: [ ... ], links, meta }
  // - detalle / create / update / join / leave / cancel: { data: { ... } }
  return response && response.data !== undefined ? response.data : response
}

const realApi = {
  async getMatches() {
    const response = await api.get('/matches')
    const items = unwrapMatchResponse(response)
    return (Array.isArray(items) ? items : []).map(normalizeMatch)
  },

  async getMatchById(id) {
    try {
      const response = await api.get(`/matches/${id}`)
      const raw = unwrapMatchResponse(response)
      return normalizeMatch(raw)
    } catch {
      return null
    }
  },

  async createMatch(payload) {
    const body = denormalizeMatch(payload)
    const response = await api.post('/matches', body)
    const raw = unwrapMatchResponse(response)
    return normalizeMatch(raw)
  },

  async joinMatch(matchId) {
    const response = await api.post(`/matches/${matchId}/join`)
    const raw = unwrapMatchResponse(response)
    return normalizeMatch(raw)
  },

  async leaveMatch(matchId) {
    const response = await api.delete(`/matches/${matchId}/leave`)
    const raw = unwrapMatchResponse(response)
    return normalizeMatch(raw)
  },

  async cancelMatch(matchId) {
    const response = await api.patch(`/matches/${matchId}/cancel`)
    const raw = unwrapMatchResponse(response)
    return normalizeMatch(raw)
  },

  async updateMatch(matchId, payload) {
    const body = denormalizeMatch(payload)
    const response = await api.put(`/matches/${matchId}`, body)
    const raw = unwrapMatchResponse(response)
    return normalizeMatch(raw)
  },
}

// ─── Selección de implementación ─────────────────────────────────────────────

const impl = USE_MOCK ? mockApi : realApi

// ─── API pública ─────────────────────────────────────────────────────────────

/** @returns {Promise<import('@/types').Match[]>} */
export async function getMatches() {
  return impl.getMatches()
}

/**
 * @param {string} id
 * @returns {Promise<import('@/types').Match | null>}
 */
export async function getMatchById(id) {
  return impl.getMatchById(id)
}

/**
 * @param {Omit<import('@/types').Match, 'id' | 'createdAt' | 'playerIds'>} payload
 * @returns {Promise<import('@/types').Match>}
 */
export async function createMatch(payload) {
  return impl.createMatch(payload)
}

/**
 * @param {string} matchId
 * @returns {Promise<import('@/types').Match>}
 */
export async function joinMatch(matchId) {
  return impl.joinMatch(matchId)
}

/**
 * @param {string} matchId
 * @returns {Promise<import('@/types').Match>}
 */
export async function leaveMatch(matchId) {
  return impl.leaveMatch(matchId)
}

/**
 * @param {string} matchId
 * @returns {Promise<import('@/types').Match>}
 */
export async function cancelMatch(matchId) {
  return impl.cancelMatch(matchId)
}

/**
 * @param {string} matchId
 * @param {string} _userId - ignorado (la API lo toma del token / mock usa localStorage)
 * @param {Partial<import('@/types').Match>} payload
 * @returns {Promise<import('@/types').Match>}
 */
export async function updateMatch(matchId, _userId, payload) {
  return impl.updateMatch(matchId, payload)
}
