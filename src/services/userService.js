/**
 * Servicio de usuarios.
 * Con VITE_USE_MOCK=true usa datos en memoria (sin backend).
 * Con VITE_USE_MOCK=false (default) usa la API REST.
 */

import { api } from '@/services/api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ─── Normalización ───────────────────────────────────────────────────────────

/**
 * @param {Object} raw
 * @returns {import('@/types').User}
 */
function normalizeUser(raw) {
  return {
    id: String(raw.id),
    name: raw.name,
    avatar:
      raw.avatar ??
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${raw.id}`,
    age: raw.age ?? null,
    position: raw.position ?? null,
    ratings: raw.ratings ?? null,
  }
}

// ─── Cache local (evita refetches en la misma sesión) ────────────────────────
/** @type {Map<string, import('@/types').User>} */
const cache = new Map()

// ─── Implementación MOCK ─────────────────────────────────────────────────────

let _mockUsers = null
async function getMockUsers() {
  if (!_mockUsers) {
    const { mockUsers } = await import('@/mock/mockUsers')
    _mockUsers = mockUsers
  }
  return _mockUsers
}

const mockApi = {
  async getUser(id) {
    if (cache.has(id)) return cache.get(id)
    const users = await getMockUsers()
    const user = users.find((u) => u.id === id) ?? null
    if (user) cache.set(id, user)
    return user
  },

  async getUsers() {
    const users = await getMockUsers()
    users.forEach((u) => cache.set(u.id, u))
    return users
  },

  async getUsersByIds(ids) {
    if (!ids.length) return []
    const users = await getMockUsers()
    return ids.map((id) => users.find((u) => u.id === id)).filter(Boolean)
  },
}

// ─── Implementación API REAL ─────────────────────────────────────────────────

const realApi = {
  async getUser(id) {
    if (cache.has(id)) return cache.get(id)
    try {
      const raw = await api.get(`/users/${id}`)
      const user = normalizeUser(raw)
      cache.set(id, user)
      return user
    } catch {
      return null
    }
  },

  async getUsers() {
    const response = await api.get('/users')
    const items = response?.data ?? response
    const users = (Array.isArray(items) ? items : []).map(normalizeUser)
    users.forEach((u) => cache.set(u.id, u))
    return users
  },

  async getUsersByIds(ids) {
    if (!ids.length) return []
    const cached = []
    const missing = []
    for (const id of ids) {
      if (cache.has(id)) cached.push(cache.get(id))
      else missing.push(id)
    }
    if (!missing.length) return cached
    const fetched = await Promise.all(missing.map((id) => realApi.getUser(id)))
    return [...cached, ...fetched.filter(Boolean)]
  },
}

// ─── Selección de implementación ─────────────────────────────────────────────

const impl = USE_MOCK ? mockApi : realApi

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * @param {string} id
 * @returns {Promise<import('@/types').User | null>}
 */
export async function getUser(id) {
  return impl.getUser(id)
}

/**
 * @returns {Promise<import('@/types').User[]>}
 */
export async function getUsers() {
  return impl.getUsers()
}

/**
 * @param {string[]} ids
 * @returns {Promise<import('@/types').User[]>}
 */
export async function getUsersByIds(ids) {
  return impl.getUsersByIds(ids)
}
