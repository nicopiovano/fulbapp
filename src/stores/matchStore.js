/**
 * Store de partidos. Toda lectura/escritura pasa por services.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import * as matchService from '@/services/matchService'

export const useMatchStore = defineStore('match', () => {
  const authStore = useAuthStore()
  const { userId } = storeToRefs(authStore)

  const matches = ref(/** @type {import('@/types').Match[]} */ ([]))
  const loading = ref(false)
  const error = ref(/** @type {string | null} */ (null))

  const matchesList = computed(() => matches.value)

  async function fetchMatches() {
    loading.value = true
    error.value = null
    try {
      const list = await matchService.getMatches()
      matches.value = [...list]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar partidos'
    } finally {
      loading.value = false
    }
  }

  async function fetchMatchById(id) {
    loading.value = true
    error.value = null
    try {
      const match = await matchService.getMatchById(id)
      const idx = matches.value.findIndex((m) => m.id === id)
      if (match) {
        if (idx >= 0) matches.value[idx] = match
        else matches.value.push(match)
      }
      return match
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar partido'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createMatch(payload) {
    if (!userId.value) throw new Error('Debes iniciar sesión')
    loading.value = true
    error.value = null
    try {
      const created = await matchService.createMatch({
        ...payload,
        createdBy: userId.value,
      })
      // Copia para evitar mutaciones y forzar reactividad
      matches.value = [{ ...created }, ...matches.value]
      return created
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al crear partido'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function joinMatch(matchId) {
    if (!userId.value) throw new Error('Debes iniciar sesión')
    error.value = null
    try {
      const updated = await matchService.joinMatch(matchId)
      const idx = matches.value.findIndex((m) => m.id === matchId)
      if (idx >= 0) {
        matches.value = matches.value.map((m, i) =>
          i === idx ? { ...updated } : { ...m }
        )
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al anotarse'
      throw e
    }
  }

  async function leaveMatch(matchId) {
    if (!userId.value) return
    error.value = null
    try {
      const updated = await matchService.leaveMatch(matchId)
      const idx = matches.value.findIndex((m) => m.id === matchId)
      if (idx >= 0) {
        matches.value = matches.value.map((m, i) =>
          i === idx ? { ...updated } : { ...m }
        )
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al bajarme'
      throw e
    }
  }

  async function cancelMatch(matchId) {
    if (!userId.value) throw new Error('Debes iniciar sesión')
    error.value = null
    try {
      const updated = await matchService.cancelMatch(matchId)
      const idx = matches.value.findIndex((m) => m.id === matchId)
      if (idx >= 0) {
        matches.value = matches.value.map((m, i) =>
          i === idx ? { ...updated } : { ...m }
        )
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cancelar partido'
      throw e
    }
  }

  async function updateMatch(matchId, payload) {
    if (!userId.value) throw new Error('Debes iniciar sesión')
    loading.value = true
    error.value = null
    try {
      const updated = await matchService.updateMatch(matchId, userId.value, payload)
      const idx = matches.value.findIndex((m) => m.id === matchId)
      if (idx >= 0) {
        matches.value = matches.value.map((m, i) =>
          i === idx ? { ...updated } : { ...m }
        )
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al actualizar partido'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    matches: matchesList,
    loading,
    error,
    fetchMatches,
    fetchMatchById,
    createMatch,
    joinMatch,
    leaveMatch,
    cancelMatch,
    updateMatch,
  }
})
