/**
 * Store de autenticación. Usuario mock por defecto; preparado para auth real.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as userService from '@/services/userService'

const MOCK_CURRENT_USER_ID = 'mock-current'

export const useAuthStore = defineStore('auth', () => {
  const userId = ref(/** @type {string | null} */ (MOCK_CURRENT_USER_ID))
  const _user = ref(/** @type {import('@/types').User | null} */ (null))

  const isAuthenticated = computed(() => !!userId.value)

  const currentUser = computed(() => _user.value)

  async function fetchCurrentUser() {
    if (!userId.value) return
    const u = await userService.getUser(userId.value)
    _user.value = u
    return u
  }

  function setUser(id) {
    userId.value = id
    _user.value = null
  }

  async function login(credentials) {
    // Simulado: aceptar cualquier cosa y usar usuario mock
    setUser(MOCK_CURRENT_USER_ID)
    await fetchCurrentUser()
  }

  function logout() {
    userId.value = null
    _user.value = null
  }

  return {
    userId,
    currentUser,
    isAuthenticated,
    fetchCurrentUser,
    setUser,
    login,
    logout,
  }
})
