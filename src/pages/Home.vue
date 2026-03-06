<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useMatchStore } from '@/stores/matchStore'
import { useUIStore } from '@/stores/uiStore'
import * as userService from '@/services/userService'
import { getDistanceKm } from '@/utils/geo'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import MatchCard from '@/components/MatchCard.vue'
import CreateMatchModal from '@/pages/CreateMatchModal.vue'
import MatchDetailModal from '@/pages/MatchDetailModal.vue'
import UserProfileModal from '@/pages/UserProfileModal.vue'
import LoginModal from '@/pages/LoginModal.vue'
import MapModal from '@/pages/MapModal.vue'

const authStore = useAuthStore()
const matchStore = useMatchStore()
const uiStore = useUIStore()
const { userId } = storeToRefs(authStore)
const { matches, loading, error } = storeToRefs(matchStore)

const filters = ref({
  type: '',
  difficultyMin: null,
  difficultyMax: null,
  dateFrom: '',
  dateTo: '',
})
const userCoords = ref(null)
const playersByMatch = ref(/** @type {Record<string, import('@/types').User[]>} */ ({}))

const filteredMatches = computed(() => {
  let list = [...matches.value]
  if (filters.value.type) {
    list = list.filter((m) => m.type === filters.value.type)
  }
  if (filters.value.difficultyMin != null) {
    list = list.filter((m) => m.difficulty >= filters.value.difficultyMin)
  }
  if (filters.value.difficultyMax != null) {
    list = list.filter((m) => m.difficulty <= filters.value.difficultyMax)
  }
  if (filters.value.dateFrom) {
    list = list.filter((m) => m.date >= filters.value.dateFrom)
  }
  if (filters.value.dateTo) {
    list = list.filter((m) => m.date <= filters.value.dateTo)
  }
  return list
})

const joinLoadingId = ref(null)

function getDistance(match) {
  if (!userCoords.value || !match.location) return null
  return getDistanceKm(
    userCoords.value.lat,
    userCoords.value.lng,
    match.location.lat,
    match.location.lng
  )
}

function getPlayers(match) {
  return playersByMatch.value[match.id] ?? []
}

async function loadPlayersForMatches() {
  const ids = new Set()
  matches.value.forEach((m) => m.playerIds?.forEach((id) => ids.add(id)))
  const users = await userService.getUsersByIds([...ids])
  const byMatch = {}
  matches.value.forEach((m) => {
    byMatch[m.id] = (m.playerIds || [])
      .map((id) => users.find((u) => u.id === id))
      .filter(Boolean)
  })
  playersByMatch.value = byMatch
}

async function updatePlayersForMatch(matchId) {
  const m = matches.value.find((x) => x.id === matchId)
  if (!m?.playerIds?.length) {
    playersByMatch.value = { ...playersByMatch.value, [matchId]: [] }
    return
  }
  const users = await userService.getUsersByIds(m.playerIds)
  playersByMatch.value = { ...playersByMatch.value, [matchId]: users }
}

async function handleJoin(match) {
  joinLoadingId.value = match.id
  try {
    await matchStore.joinMatch(match.id)
    await updatePlayersForMatch(match.id)
  } finally {
    joinLoadingId.value = null
  }
}

async function handleLeave(match) {
  joinLoadingId.value = match.id
  try {
    await matchStore.leaveMatch(match.id)
    await updatePlayersForMatch(match.id)
  } finally {
    joinLoadingId.value = null
  }
}

function openDetail(match) {
  uiStore.openMatchDetail(match.id)
}

onMounted(async () => {
  await authStore.fetchCurrentUser()
  await matchStore.fetchMatches()
  await loadPlayersForMatches()
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      },
      () => {}
    )
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
    <AppNavbar />
    <main class="relative z-0 mx-auto max-w-6xl px-4 pt-6 pb-8">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Partidos disponibles</h1>
        <button
          type="button"
          class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 md:hidden"
          @click="uiStore.openCreateMatch()"
        >
          Crear partido
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          @click="uiStore.toggleFilters()"
        >
          Filtros
        </button>
      </div>

      <p v-if="error" class="mb-4 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      <div v-if="loading" class="py-12 text-center text-slate-500 dark:text-slate-400">Cargando partidos…</div>
      <div
        v-else
        class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1"
      >
        <MatchCard
          v-for="m in filteredMatches"
          :key="m.id"
          :match="m"
          :players="getPlayers(m)"
          :current-user-id="userId ?? ''"
          :distance-km="getDistance(m)"
          :loading="joinLoadingId === m.id"
          @click="openDetail(m)"
          @join="handleJoin(m)"
          @leave="handleLeave(m)"
        />
      </div>
      <p v-if="!loading && !filteredMatches.length" class="py-12 text-center text-slate-500 dark:text-slate-400">
        No hay partidos que coincidan con los filtros.
      </p>
    </main>
    <AppFooter />
  </div>

  <FilterPanel
    :open="uiStore.filtersOpen"
    :filters="filters"
    @update:filters="filters = $event"
    @close="uiStore.closeFilters()"
  />
  <CreateMatchModal />
  <MatchDetailModal @closed="(id) => id && updatePlayersForMatch(id)" />
  <UserProfileModal />
  <LoginModal />
  <MapModal />
</template>
