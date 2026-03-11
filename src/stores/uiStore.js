/**
 * Store de UI: modales y panel de filtros. Pensado para SPA con overlays.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const modal = ref(/** @type {string | null} */ (null))
  const modalPayload = ref(/** @type {Record<string, unknown> | null} */ (null))
  const filtersOpen = ref(false)

  const isCreateMatchOpen = computed(() => modal.value === 'createMatch')
  const isMatchDetailOpen = computed(() => modal.value === 'matchDetail')
  const isUserProfileOpen = computed(() => modal.value === 'userProfile')
  const isLoginOpen = computed(() => modal.value === 'login')
  const isMapOpen = computed(() => modal.value === 'map')

  /**
   * @param {string} [editMatchId] - si se pasa, el modal se abre en modo edición
   */
  function openCreateMatch(editMatchId) {
    modal.value = 'createMatch'
    modalPayload.value = editMatchId ? { matchId: editMatchId } : null
  }

  function openMatchDetail(matchId) {
    modal.value = 'matchDetail'
    modalPayload.value = { matchId }
  }

  function openUserProfile(userId) {
    modal.value = 'userProfile'
    modalPayload.value = { userId }
  }

  function openLogin() {
    modal.value = 'login'
    modalPayload.value = null
  }

  function openMap() {
    modal.value = 'map'
    modalPayload.value = null
  }

  function closeModal() {
    modal.value = null
    modalPayload.value = null
  }

function toggleFilters() {
  filtersOpen.value = !filtersOpen.value
}

function closeFilters() {
  filtersOpen.value = false
}

return {
  modal,
  modalPayload,
  filtersOpen,
  isCreateMatchOpen,
  isMatchDetailOpen,
  isUserProfileOpen,
  isLoginOpen,
  isMapOpen,
  openCreateMatch,
  openMatchDetail,
  openUserProfile,
  openLogin,
  openMap,
  closeModal,
  toggleFilters,
  closeFilters,
}
})
