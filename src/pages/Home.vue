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
  fieldSurface: '',
  establishmentCovered: '',
  hasBuffet: false,
  hasVestuario: false,
  matchGender: '',
})

// Filtros rápidos (chips)
const quickToday = ref(false)
const quickNear = ref(false)
const quickF5 = ref(false)
const quickLevelMid = ref(false)
const quickVestuario = ref(false)
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
  if (filters.value.fieldSurface) {
    list = list.filter((m) => m.fieldSurface === filters.value.fieldSurface)
  }
  if (filters.value.establishmentCovered) {
    list = list.filter((m) => m.establishmentCovered === filters.value.establishmentCovered)
  }
  if (filters.value.hasBuffet) {
    list = list.filter((m) => Array.isArray(m.establishmentAmenities) && m.establishmentAmenities.includes('buffet'))
  }
  if (filters.value.hasVestuario) {
    list = list.filter((m) => Array.isArray(m.establishmentAmenities) && m.establishmentAmenities.includes('vestuario'))
  }
  if (filters.value.matchGender) {
    list = list.filter((m) => m.matchGender === filters.value.matchGender)
  }

  // Filtros rápidos
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`

  if (quickToday.value) {
    list = list.filter((m) => m.date === todayStr)
  }
  if (quickF5.value) {
    list = list.filter((m) => m.type === 'f5')
  }
  if (quickLevelMid.value) {
    list = list.filter((m) => (m.difficulty ?? 0) >= 5 && (m.difficulty ?? 0) <= 7)
  }
  if (quickVestuario.value) {
    list = list.filter(
      (m) => Array.isArray(m.establishmentAmenities) && m.establishmentAmenities.includes('vestuario')
    )
  }
  if (quickNear.value && userCoords.value) {
    list = list
      .map((m) => ({ match: m, dist: getDistance(m) }))
      .filter((item) => item.dist != null && item.dist <= 5)
      .map((item) => item.match)
  }
  return list
})

const sortBy = ref('recommended')

const sortedMatches = computed(() => {
  const list = [...filteredMatches.value]
  if (sortBy.value === 'near') {
    return list
      .map((m) => ({ match: m, dist: getDistance(m) ?? Number.POSITIVE_INFINITY }))
      .sort((a, b) => a.dist - b.dist)
      .map((item) => item.match)
  }
  if (sortBy.value === 'upcoming') {
    return list.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || (a.time ?? '').localeCompare(b.time ?? ''))
  }
  if (sortBy.value === 'level-asc') {
    return list.sort((a, b) => (a.difficulty ?? 0) - (b.difficulty ?? 0))
  }
  if (sortBy.value === 'level-desc') {
    return list.sort((a, b) => (b.difficulty ?? 0) - (a.difficulty ?? 0))
  }
  if (sortBy.value === 'level-similar') {
    const base = 6 // nivel medio aproximado hasta tener nivel real de usuario
    return list.sort(
      (a, b) => Math.abs((a.difficulty ?? base) - base) - Math.abs((b.difficulty ?? base) - base)
    )
  }

  // Recomendados: hoy + pocos cupos + cerca + fecha próxima
  const now = Date.now()
  return list
    .map((m) => {
      const slotsLeft = Math.max((m.maxPlayers ?? 0) - (m.playerIds?.length ?? 0), 0)
      const isToday = m.date ===
        (() => {
          const d = new Date()
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate()
          ).padStart(2, '0')}`
        })()
      const dist = getDistance(m) ?? 999
      const d = m.date ? new Date(m.date).getTime() : now
      let score = 0
      if (isToday) score += 40
      if (slotsLeft <= 2) score += 30
      if (slotsLeft === 1) score += 10
      score += Math.max(0, 20 - Math.min(dist * 3, 20)) // más puntos si está cerca
      score += Math.max(0, 20 - Math.max(0, (d - now) / (1000 * 60 * 60 * 24))) // más puntos si es pronto
      return { match: m, score }
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.match)
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
        <div class="flex flex-wrap items-center gap-2">
          <label class="text-sm text-slate-600 dark:text-slate-400">Ordenar por</label>
          <select
            v-model="sortBy"
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="recommended">Recomendados</option>
            <option value="near">Más cercanos</option>
            <option value="upcoming">Próximos</option>
            <option value="level-similar">Nivel similar</option>
            <option value="level-asc">Nivel (menor a mayor)</option>
            <option value="level-desc">Nivel (mayor a menor)</option>
          </select>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          @click="uiStore.toggleFilters()"
        >
          Filtros
        </button>
      </div>

      <div class="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
          :class="quickToday ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'"
          @click="quickToday = !quickToday"
        >
          Hoy
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
          :class="quickNear ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'"
          @click="quickNear = !quickNear"
        >
          Cerca
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
          :class="quickF5 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'"
          @click="quickF5 = !quickF5"
        >
          Fútbol 5
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
          :class="quickLevelMid ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'"
          @click="quickLevelMid = !quickLevelMid"
        >
          Nivel 5–7
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
          :class="quickVestuario ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'"
          @click="quickVestuario = !quickVestuario"
        >
          Con vestuario
        </button>
      </div>

      <p v-if="error" class="mb-4 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      <div v-if="loading" class="py-12 text-center text-slate-500 dark:text-slate-400">Cargando partidos…</div>
      <div
        v-else
        class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1"
      >
        <MatchCard
          v-for="m in sortedMatches"
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
      <p v-if="!loading && !sortedMatches.length" class="py-12 text-center text-slate-500 dark:text-slate-400">
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
