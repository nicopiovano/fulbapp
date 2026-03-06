<script setup>
import { computed } from 'vue'
import { MATCH_TYPES } from '@/types'
import { formatMatchDate } from '@/utils/formatDate'
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
const displayDate = computed(() => formatMatchDate(props.match.date, props.match.time))
const displayPrice = computed(() => formatPrice(props.match.price))
</script>

<template>
  <article
    class="group flex flex-col rounded-card border border-slate-200 bg-white p-4 shadow-card cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500 dark:hover:shadow-primary-500/5"
    @click="emit('click')"
  >
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <span class="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">
        {{ typeLabel }}
      </span>
      <DifficultyBadge :level="match.difficulty" />
      <span v-if="isNew" class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">Nuevo</span>
      <span v-if="isCompetitive" class="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
        Competitivo
      </span>
      <span v-if="isAlmostFull" class="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
        Casi lleno
      </span>
    </div>

    <p class="text-lg font-semibold text-slate-800 dark:text-slate-100">{{ match.placeName }}</p>
    <p class="text-sm text-slate-500 dark:text-slate-400">
      {{ displayDate }}
    </p>
    <p v-if="displayPrice" class="text-sm font-medium text-slate-700 dark:text-slate-200">
      {{ displayPrice }}
    </p>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
      Jugadores: {{ count }} / {{ max }}
    </p>
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

    <div class="mt-4 flex justify-end" @click.stop>
      <JoinMatchButton
        :joined="isJoined"
        :full="isFull"
        :loading="loading"
        @click="isJoined ? emit('leave') : emit('join')"
      />
    </div>
  </article>
</template>
