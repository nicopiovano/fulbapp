<script setup>
import { computed } from 'vue'
import { MATCH_TYPES, FIELD_SURFACE_TYPES, ESTABLISHMENT_COVERED, ESTABLISHMENT_AMENITIES, MATCH_GENDERS } from '@/types'
import { formatMatchDate } from '@/utils/formatDate'
import { isMatchPast as checkMatchPast } from '@/utils/matchDate'
import { formatPrice } from '@/utils/formatPrice'
import DifficultyBadge from './DifficultyBadge.vue'
import JoinMatchButton from './JoinMatchButton.vue'
import PlayerAvatar from './PlayerAvatar.vue'

const props = defineProps({
  match: {
    type: Object,
    required: true,
    // Match + optional distanceKm, players (User[])
  },
  players: { type: Array, default: () => [] },
  currentUserId: { type: String, default: '' },
  distanceKm: { type: Number, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['click', 'join', 'leave'])

const typeLabel = computed(() => MATCH_TYPES[props.match.type]?.label ?? props.match.type)

// Colores del texto de fondo por tipo (mismo orden que tailwind matchType)
const MATCH_TYPE_COLORS = {
  f5: '#22c55e',
  f7: '#3b82f6',
  f8: '#f59e0b',
  f9: '#8b5cf6',
  f11: '#e11d48',
}
const watermarkStyle = computed(() => {
  const hex = MATCH_TYPE_COLORS[props.match.type] ?? '#64748b'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { color: `rgba(${r}, ${g}, ${b}, 0.18)` }
})
const count = computed(() => props.match.playerIds?.length ?? 0)
const max = computed(() => props.match.maxPlayers ?? 0)
const isFull = computed(() => count.value >= max.value)
const isJoined = computed(() =>
  props.currentUserId && props.match.playerIds?.includes(props.currentUserId)
)
const displayDistance = computed(() => {
  if (props.distanceKm == null) return null
  if (props.distanceKm < 1) return `${Math.round(props.distanceKm * 1000)} m`
  return `${props.distanceKm.toFixed(1)} km`
})
const isNew = computed(() => {
  const created = props.match.createdAt ? new Date(props.match.createdAt).getTime() : 0
  return Date.now() - created < 48 * 60 * 60 * 1000
})
const isCompetitive = computed(() => props.match.difficulty >= 8)
const isAlmostFull = computed(() => max.value > 0 && count.value >= max.value - 2 && !isFull.value)
const isMatchPast = computed(() =>
  checkMatchPast(props.match?.date, props.match?.time)
)
const displayDate = computed(() => formatMatchDate(props.match.date, props.match.time))
const displayPrice = computed(() => formatPrice(props.match.price))
const fieldSurfaceLabel = computed(() =>
  props.match.fieldSurface ? FIELD_SURFACE_TYPES[props.match.fieldSurface]?.label : null
)
const establishmentCoveredLabel = computed(() =>
  props.match.establishmentCovered ? ESTABLISHMENT_COVERED[props.match.establishmentCovered]?.label : null
)
const amenitiesLabels = computed(() => {
  const arr = props.match.establishmentAmenities || []
  return arr.map((key) => ESTABLISHMENT_AMENITIES[key]?.label).filter(Boolean)
})
const matchGenderLabel = computed(() =>
  props.match.matchGender ? MATCH_GENDERS[props.match.matchGender]?.label : null
)
</script>

<template>
  <article
    class="match-card group relative flex flex-col overflow-hidden rounded-card border-l-4 border border-slate-200 bg-white p-4 shadow-card cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500 dark:hover:shadow-primary-500/5"
    :class="[
      `match-card--${match.type}`,
      match.type === 'f5' && 'border-l-matchType-f5',
      match.type === 'f7' && 'border-l-matchType-f7',
      match.type === 'f8' && 'border-l-matchType-f8',
      match.type === 'f9' && 'border-l-matchType-f9',
      match.type === 'f11' && 'border-l-matchType-f11',
    ]"
    @click="emit('click')"
  >
    <div
      class="pointer-events-none absolute inset-0 flex items-start justify-end pt-2 pr-3"
      aria-hidden="true"
    >
      <span
        class="select-none text-lg font-bold tracking-tight"
        :style="watermarkStyle"
      >
        {{ typeLabel }}
      </span>
    </div>
    <div class="relative z-10 space-y-1">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <DifficultyBadge :level="match.difficulty" />
        <span v-if="isNew" class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">Nuevo</span>
        <span v-if="isCompetitive" class="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
          Competitivo
        </span>
        <span v-if="isAlmostFull" class="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          Casi lleno
        </span>
        <span v-if="isFull" class="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900/40 dark:text-red-200">
          Lleno
        </span>
      </div>

      <p class="text-lg font-semibold text-slate-800 dark:text-slate-100">{{ match.placeName }}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ displayDate }}</p>
      <p v-if="displayPrice" class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ displayPrice }}</p>
      <div v-if="fieldSurfaceLabel || establishmentCoveredLabel || amenitiesLabels.length || matchGenderLabel" class="mt-1 flex flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span v-if="fieldSurfaceLabel" class="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-700">{{ fieldSurfaceLabel }}</span>
        <span v-if="establishmentCoveredLabel" class="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-700">{{ establishmentCoveredLabel }}</span>
        <span v-for="l in amenitiesLabels" :key="l" class="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-700">{{ l }}</span>
        <span v-if="matchGenderLabel" class="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-700">{{ matchGenderLabel }}</span>
      </div>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Jugadores: {{ count }} / {{ max }}</p>
      <p v-if="displayDistance" class="text-sm text-slate-500 dark:text-slate-400">~ {{ displayDistance }}</p>
      <div v-if="players.length" class="mt-2 flex -space-x-2">
        <PlayerAvatar
          v-for="p in players.slice(0, 5)"
          :key="p.id"
          :src="p.avatar"
          :name="p.name"
          size="sm"
        />
      </div>

      <div v-if="!isMatchPast" class="mt-4 flex justify-end" @click.stop>
        <JoinMatchButton
          :joined="isJoined"
          :full="isFull"
          :loading="loading"
          @click="isJoined ? emit('leave') : emit('join')"
        />
      </div>
    </div>
  </article>
</template>
