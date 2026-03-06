<script setup>
import { ref, computed, watch } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import * as userService from '@/services/userService'
import * as ratingService from '@/services/ratingService'
import { RATING_CATEGORIES } from '@/types'
import { getOverallAverage } from '@/utils/ratingAverage'
import BaseModal from '@/components/BaseModal.vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import RatingStars from '@/components/RatingStars.vue'

const uiStore = useUIStore()
const user = ref(null)
const userRatings = ref(null)
const userId = computed(() => uiStore.modalPayload?.userId ?? null)

const positionLabels = {
  arquero: 'Arquero',
  defensor: 'Defensor',
  mediocampista: 'Mediocampista',
  delantero: 'Delantero',
}
const categoryLabels = {
  habilidad: 'Habilidad',
  puntualidad: 'Puntualidad',
  asistencia: 'Asistencia',
  amabilidad: 'Amabilidad',
  fair_play: 'Fair play',
}

const hasServiceRatings = computed(() => {
  if (!userRatings.value) return false
  return Object.values(userRatings.value).some((v) => v > 0)
})

const displayRatings = computed(() =>
  hasServiceRatings.value ? userRatings.value : (user.value?.ratings ?? {})
)

const overallRating = computed(() => getOverallAverage(displayRatings.value))

async function load() {
  if (!userId.value) return
  user.value = await userService.getUser(userId.value)
  userRatings.value = await ratingService.getRatingAveragesForUser(userId.value)
}

watch(userId, () => {
  if (userId.value) load()
}, { immediate: true })

const show = computed(() => uiStore.isUserProfileOpen)
</script>

<template>
  <BaseModal
    :show="show"
    title="Perfil"
    @close="uiStore.closeModal()"
  >
    <div v-if="!user && userId" class="p-6 text-center text-slate-500 dark:text-slate-400">Cargando…</div>
    <div v-else-if="user" class="p-4 space-y-6">
      <div class="flex flex-col items-center text-center">
        <PlayerAvatar :src="user.avatar" :name="user.name" size="xl" class="mb-3" />
        <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-100">{{ user.name }}</h3>
        <p v-if="user.age" class="text-slate-500 dark:text-slate-400">{{ user.age }} años</p>
        <p v-if="user.position" class="text-sm text-slate-600 dark:text-slate-300">
          {{ positionLabels[user.position] || user.position }}
        </p>
      </div>

      <div class="rounded-card border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700/50">
        <h4 class="font-semibold text-slate-800 dark:text-slate-100 mb-2">Reputación</h4>
        <div class="flex items-center gap-2 mb-3">
          <RatingStars :value="overallRating" :max="5" size="lg" show-value />
          <span class="text-slate-500 dark:text-slate-400 text-sm">promedio</span>
        </div>
        <ul class="space-y-2">
          <li
            v-for="cat in RATING_CATEGORIES"
            :key="cat"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-slate-600 dark:text-slate-300">{{ categoryLabels[cat] || cat }}</span>
            <RatingStars :value="displayRatings[cat] ?? 0" :max="5" size="sm" show-value />
          </li>
        </ul>
      </div>
    </div>
  </BaseModal>
</template>
