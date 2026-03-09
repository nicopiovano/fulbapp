/**
 * Store de autenticación.
 * Con VITE_USE_MOCK=true simula login con el usuario mock-current.
 * Con VITE_USE_MOCK=false (default) usa Sanctum token-based auth.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, getToken, setToken } from '@/services/api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const MOCK_USER_KEY = 'fulbapp_mock_user'

const MOCK_CURRENT_USER = {
  id: 'mock-current',
  name: 'Yo (Usuario actual)',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
  age: 26,
  position: 'defensor',
  ratings: null,
}

function normalizeUser(raw) {
  return {
    id: String(raw.id),
    name: raw.name,
    avatar:
      raw.avatar ??
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${raw.id}`,
    age: raw.age ?? null,
    position: raw.position ?? null,
    ratings: null,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const userId = ref(/** @type {string | null} */ (null))
  const _user  = ref(/** @type {import('@/types').User | null} */ (null))

  const isAuthenticated = computed(() => !!userId.value)
  const currentUser     = computed(() => _user.value)

  // ─── Inicialización ────────────────────────────────────────────────────────

  async function init() {
    if (USE_MOCK) {
      const stored = localStorage.getItem(MOCK_USER_KEY)
      if (stored) {
        try {
          const user = JSON.parse(stored)
          _user.value  = user
          userId.value = user.id
        } catch {
          localStorage.removeItem(MOCK_USER_KEY)
        }
      }
      return
    }

    if (!getToken()) return
    try {
      const raw = await api.get('/me')
      _user.value  = normalizeUser(raw)
      userId.value = String(raw.id)
    } catch (e) {
      // Solo invalidar el token si el servidor rechaza explícitamente (401/403).
      // Errores de red o backend caído no deben cerrar la sesión.
      if (e?.status === 401 || e?.status === 403) {
        setToken(null)
      }
    }
  }

  // ─── Recarga usuario actual ────────────────────────────────────────────────

  async function fetchCurrentUser() {
    if (USE_MOCK) return _user.value

    if (!getToken()) return null
    try {
      const raw = await api.get('/me')
      _user.value  = normalizeUser(raw)
      userId.value = String(raw.id)
      return _user.value
    } catch {
      return null
    }
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  /**
   * @param {{ email: string, password: string }} credentials
   */
  async function login(credentials) {
    if (USE_MOCK) {
      // En modo mock, cualquier credencial loguea como mock-current
      _user.value  = MOCK_CURRENT_USER
      userId.value = MOCK_CURRENT_USER.id
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(MOCK_CURRENT_USER))
      return _user.value
    }

    const data = await api.post('/login', credentials)
    setToken(data.token)
    _user.value  = normalizeUser(data.user)
    userId.value = String(data.user.id)
    return _user.value
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  async function logout() {
    if (USE_MOCK) {
      localStorage.removeItem(MOCK_USER_KEY)
      userId.value = null
      _user.value  = null
      return
    }

    try {
      await api.post('/logout')
    } catch {
      // Ignorar errores de red al cerrar sesión
    } finally {
      setToken(null)
      userId.value = null
      _user.value  = null
    }
  }

  /** Util para tests o cambio manual de usuario */
  function setUser(id) {
    userId.value = id
    _user.value  = null
  }

  return {
    userId,
    currentUser,
    isAuthenticated,
    init,
    fetchCurrentUser,
    login,
    logout,
    setUser,
  }
})
