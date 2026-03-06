<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useMatchStore } from '@/stores/matchStore'
import { useUIStore } from '@/stores/uiStore'
import { MATCH_TYPES, RATING_CATEGORIES, FIELD_SURFACE_TYPES, ESTABLISHMENT_COVERED, ESTABLISHMENT_AMENITIES, MATCH_GENDERS } from '@/types'
import { formatMatchDate, formatMatchDateFull } from '@/utils/formatDate'
import { isMatchPast as checkMatchPast } from '@/utils/matchDate'
import { formatPrice } from '@/utils/formatPrice'
import * as userService from '@/services/userService'
import * as ratingService from '@/services/ratingService'
import { balanceTeams } from '@/utils/teamBalancer'
import BaseModal from '@/components/BaseModal.vue'
import DifficultyBadge from '@/components/DifficultyBadge.vue'
import JoinMatchButton from '@/components/JoinMatchButton.vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import RatingInput from '@/components/RatingInput.vue'
import RatingStars from '@/components/RatingStars.vue'
import TeamCard from '@/components/TeamCard.vue'
import MapPicker from '@/components/MapPicker.vue'

const CATEGORY_LABELS = {
  habilidad: 'Habilidad',
  puntualidad: 'Puntualidad',
  asistencia: 'Asistencia',
  amabilidad: 'Amabilidad',
  fair_play: 'Fair play',
}

const uiStore = useUIStore()
const authStore = useAuthStore()
const matchStore = useMatchStore()
const { userId } = storeToRefs(authStore)

const match = ref(null)
const players = ref([])
const playerRatings = ref(/** @type {Record<string, Record<string, number>>} */ ({}))
const joinLoading = ref(false)
const matchRatings = ref([])
const ratingScores = ref({})
const ratingLoading = ref(false)
const matchId = computed(() => uiStore.modalPayload?.matchId ?? null)

const typeLabel = computed(() => (match.value ? MATCH_TYPES[match.value.type]?.label : ''))
const count = computed(() => match.value?.playerIds?.length ?? 0)
const max = computed(() => match.value?.maxPlayers ?? 0)
const isFull = computed(() => count.value >= max.value)
const isJoined = computed(() =>
  userId.value && match.value?.playerIds?.includes(userId.value)
)

const isMatchPast = computed(() =>
  checkMatchPast(match.value?.date, match.value?.time)
)

const isCreator = computed(() =>
  userId.value && match.value?.createdBy === userId.value
)

const participantsToRate = computed(() =>
  players.value.filter((p) => p.id !== match.value?.createdBy)
)

const hasRated = (toUserId) =>
  matchRatings.value.some(
    (r) => r.fromUserId === userId.value && r.toUserId === toUserId
  )

function getPlayerSkill(p) {
  const apiRating = playerRatings.value[p.id]?.habilidad
  const fallback = p.ratings?.habilidad ?? 0
  return apiRating != null && apiRating > 0 ? apiRating : fallback
}

const balanced = computed(() => {
  if (!players.value.length) return null
  const withSkill = players.value.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    skill: getPlayerSkill(p),
  }))
  return balanceTeams(withSkill)
})

const teamAPlayers = computed(() => {
  if (!balanced.value) return []
  return balanced.value.teamA.map((p) => players.value.find((u) => u.id === p.id)).filter(Boolean)
})
const teamBPlayers = computed(() => {
  if (!balanced.value) return []
  return balanced.value.teamB.map((p) => players.value.find((u) => u.id === p.id)).filter(Boolean)
})

async function load() {
  if (!matchId.value) return
  const m = await matchStore.fetchMatchById(matchId.value)
  match.value = m
  if (m?.playerIds?.length) {
    players.value = await userService.getUsersByIds(m.playerIds)
    const ratingsMap = {}
    for (const pid of m.playerIds) {
      ratingsMap[pid] = await ratingService.getRatingAveragesForUser(pid)
    }
    playerRatings.value = ratingsMap
  } else {
    players.value = []
    playerRatings.value = {}
  }
  matchRatings.value = await ratingService.getRatingsForMatch(matchId.value)
}

async function handleJoin() {
  if (!matchId.value || !userId.value) return
  joinLoading.value = true
  try {
    await matchStore.joinMatch(matchId.value)
    await load()
  } finally {
    joinLoading.value = false
  }
}

async function handleLeave() {
  if (!matchId.value || !userId.value) return
  joinLoading.value = true
  try {
    await matchStore.leaveMatch(matchId.value)
    await load()
  } finally {
    joinLoading.value = false
  }
}

function openProfile(id) {
  uiStore.openUserProfile(id)
}

function getScoresKey(toUserId) {
  return `${matchId.value}-${toUserId}`
}

function initScores(toUserId) {
  const key = getScoresKey(toUserId)
  if (!ratingScores.value[key]) {
    ratingScores.value[key] = {
      habilidad: 0,
      puntualidad: 0,
      asistencia: 0,
      amabilidad: 0,
      fair_play: 0,
    }
  }
  return ratingScores.value[key]
}

function setScore(toUserId, cat, value) {
  const key = getScoresKey(toUserId)
  if (!ratingScores.value[key]) ratingScores.value[key] = {}
  ratingScores.value[key][cat] = value
  ratingScores.value = { ...ratingScores.value }
}

function getScore(toUserId, cat) {
  return ratingScores.value[getScoresKey(toUserId)]?.[cat] ?? 0
}

function canSubmit(toUserId) {
  const scores = ratingScores.value[getScoresKey(toUserId)]
  if (!scores) return false
  return RATING_CATEGORIES.every((c) => scores[c] >= 1 && scores[c] <= 5)
}

async function submitRating(toUserId) {
  if (!userId.value || !matchId.value || !canSubmit(toUserId)) return
  ratingLoading.value = true
  try {
    const scores = { ...ratingScores.value[getScoresKey(toUserId)] }
    await ratingService.ratePlayer({
      fromUserId: userId.value,
      toUserId,
      matchId: matchId.value,
      scores,
    })
    matchRatings.value = await ratingService.getRatingsForMatch(matchId.value)
    const updatedRatings = await ratingService.getRatingAveragesForUser(toUserId)
    playerRatings.value = { ...playerRatings.value, [toUserId]: updatedRatings }
  } finally {
    ratingLoading.value = false
  }
}

watch(
  () => [uiStore.isMatchDetailOpen, matchId.value],
  ([isOpen, id]) => {
    if (isOpen && id) load()
  },
  { immediate: true }
)

const show = computed(() => uiStore.isMatchDetailOpen)

const emit = defineEmits(['closed'])
function handleClose() {
  const id = matchId.value
  emit('closed', id)
  uiStore.closeModal()
}
</script>

<template>
  <BaseModal
    :show="show"
    title="Detalle del partido"
    @close="handleClose"
  >
    <div v-if="!match && matchId" class="p-6 text-center text-slate-500 dark:text-slate-400">Cargando…</div>
    <div v-else-if="match" class="p-4 space-y-6">
      <div class="flex flex-wrap gap-2">
        <span class="rounded bg-primary-100 px-2 py-0.5 text-sm font-medium text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">
          {{ typeLabel }}
        </span>
        <DifficultyBadge :level="match.difficulty" />
        <span class="text-slate-600 dark:text-slate-300">{{ formatMatchDateFull(match.date, match.time) }}</span>
      </div>
      <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-100">{{ match.placeName }}</h3>
      <p v-if="match.price" class="text-base font-medium text-slate-700 dark:text-slate-200">
        {{ formatPrice(match.price) }}
      </p>
      <p v-if="match.description" class="text-slate-600 dark:text-slate-300">{{ match.description }}</p>
      <div v-if="match.fieldSurface || match.establishmentCovered || (match.establishmentAmenities && match.establishmentAmenities.length) || match.matchGender" class="flex flex-wrap gap-2 text-sm">
        <span v-if="match.fieldSurface" class="rounded bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
          Cancha: {{ FIELD_SURFACE_TYPES[match.fieldSurface]?.label }}
        </span>
        <span v-if="match.establishmentCovered" class="rounded bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
          {{ ESTABLISHMENT_COVERED[match.establishmentCovered]?.label }}
        </span>
        <template v-if="match.establishmentAmenities?.length">
          <span
            v-for="key in match.establishmentAmenities"
            :key="key"
            class="rounded bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
          >
            {{ ESTABLISHMENT_AMENITIES[key]?.label }}
          </span>
        </template>
        <span v-if="match.matchGender" class="rounded bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
          {{ MATCH_GENDERS[match.matchGender]?.label }}
        </span>
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400">Jugadores: {{ count }} / {{ max }}</p>

      <div class="rounded-card border border-slate-200 overflow-hidden bg-slate-50 dark:border-slate-600 dark:bg-slate-700/50" style="height: 200px">
        <MapPicker :model-value="match.location" :height="'200px'" placeholder="" readonly />
      </div>

      <div>
        <h4 class="font-semibold text-slate-800 dark:text-slate-100 mb-2">Jugadores anotados</h4>
        <ul class="space-y-2">
          <li
            v-for="p in players"
            :key="p.id"
            class="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 cursor-pointer hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700"
            @click="openProfile(p.id)"
          >
            <PlayerAvatar :src="p.avatar" :name="p.name" size="md" />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-slate-800 dark:text-slate-200 truncate">{{ p.name }}</p>
              <RatingStars :value="getPlayerSkill(p)" :max="5" size="sm" show-value />
            </div>
          </li>
        </ul>
      </div>

      <div
        v-if="isMatchPast && isCreator && participantsToRate.length"
        id="calificar-jugadores"
        class="space-y-4 rounded-card border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700/30"
      >
        <h4 class="font-semibold text-slate-800 dark:text-slate-100">Calificar jugadores</h4>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          El partido ya finalizó. Valorá a cada jugador para mejorar su reputación.
        </p>
        <div
          v-for="p in participantsToRate"
          :key="p.id"
          class="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800"
        >
          <div class="mb-3 flex items-center gap-3">
            <PlayerAvatar :src="p.avatar" :name="p.name" size="sm" />
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ p.name }}</span>
            <span
              v-if="hasRated(p.id)"
              class="ml-auto rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
            >
              Valorado
            </span>
          </div>
          <template v-if="!hasRated(p.id)">
            <div class="space-y-2">
              <RatingInput
                v-for="cat in RATING_CATEGORIES"
                :key="cat"
                :model-value="getScore(p.id, cat)"
                :label="CATEGORY_LABELS[cat]"
                @update:model-value="setScore(p.id, cat, $event)"
              />
            </div>
            <button
              type="button"
              class="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 dark:bg-primary-500"
              :disabled="!canSubmit(p.id) || ratingLoading"
              @click="submitRating(p.id)"
            >
              Enviar valoración
            </button>
          </template>
        </div>
      </div>

      <div v-if="balanced && (balanced.teamA.length || balanced.teamB.length)" class="space-y-4">
        <h4 class="font-semibold text-slate-800 dark:text-slate-100">Equipos sugeridos</h4>
        <div class="grid md:grid-cols-2 gap-4">
          <TeamCard
            title="Equipo A"
            :players="teamAPlayers.map((p) => ({ ...p, skill: getPlayerSkill(p) }))"
            :average-skill="balanced.avgA"
          />
          <TeamCard
            title="Equipo B"
            :players="teamBPlayers.map((p) => ({ ...p, skill: getPlayerSkill(p) }))"
            :average-skill="balanced.avgB"
          />
        </div>
      </div>

      <div v-if="!isMatchPast" class="flex gap-3 pt-2">
        <JoinMatchButton
          v-if="!isJoined && !isFull"
          :loading="joinLoading"
          @click="handleJoin()"
        />
        <JoinMatchButton
          v-else-if="isJoined"
          :joined="true"
          :loading="joinLoading"
          @click="handleLeave()"
        />
      </div>
      <div v-else-if="isMatchPast && isCreator && participantsToRate.length" class="flex gap-3 pt-2">
        <a
          href="#calificar-jugadores"
          class="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 dark:bg-primary-500"
        >
          Calificar jugadores
        </a>
      </div>
    </div>
  </BaseModal>
</template>
