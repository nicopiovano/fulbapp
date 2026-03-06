<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import * as userService from '@/services/userService'
import * as ratingService from '@/services/ratingService'
import { getOverallAverage } from '@/utils/ratingAverage'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import RatingStars from '@/components/RatingStars.vue'
import UserProfileModal from '@/pages/UserProfileModal.vue'
import { MessageCircle } from 'lucide-vue-next'

const authStore = useAuthStore()
const uiStore = useUIStore()
const { userId } = storeToRefs(authStore)

const users = ref([])
const ratingsByUser = ref(/** @type {Record<string, Record<string, number>>} */ ({}))
const loading = ref(true)

const filteredUsers = computed(() => {
  return users.value.filter((u) => u.id !== userId.value)
})

function getOverall(u) {
  const api = ratingsByUser.value[u.id]
  const fallback = u.ratings
  const display = api && Object.values(api).some((v) => v > 0) ? api : fallback
  return getOverallAverage(display ?? {})
}

function openProfile(id) {
  uiStore.openUserProfile(id)
}

function contactUser(id) {
  openProfile(id)
  // TODO: futuro inbox - abrir conversación directa
}

onMounted(async () => {
  loading.value = true
  try {
    users.value = await userService.getUsers()
    const map = {}
    for (const u of users.value) {
      map[u.id] = await ratingService.getRatingAveragesForUser(u.id)
    }
    ratingsByUser.value = map
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
    <AppNavbar />
    <main class="mx-auto w-full max-w-6xl px-4 py-6 flex-1">
      <h1 class="mb-4 text-xl font-semibold text-slate-800 dark:text-slate-100">
        Usuarios registrados
      </h1>
      <p class="mb-6 text-sm text-slate-600 dark:text-slate-400">
        Explorá la comunidad y contactá a otros jugadores. El inbox estará disponible próximamente.
      </p>

      <div v-if="loading" class="py-12 text-center text-slate-500 dark:text-slate-400">
        Cargando usuarios…
      </div>
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1"
      >
        <article
          v-for="u in filteredUsers"
          :key="u.id"
          class="flex flex-col items-center rounded-card border border-slate-200 bg-white p-3 shadow-card transition-colors hover:border-primary-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500"
        >
          <button
            type="button"
            class="flex flex-col items-center w-full text-center"
            @click="openProfile(u.id)"
          >
            <PlayerAvatar :src="u.avatar" :name="u.name" size="md" class="mb-2" />
            <p class="font-medium text-slate-800 dark:text-slate-100 text-sm truncate w-full">{{ u.name }}</p>
            <p v-if="u.position" class="text-xs text-slate-500 dark:text-slate-400 capitalize truncate w-full">
              {{ u.position }}
            </p>
            <RatingStars :value="getOverall(u)" :max="5" size="sm" show-value class="mt-1" />
          </button>
          <button
            type="button"
            class="mt-2 flex items-center justify-center gap-1 rounded-lg border border-primary-300 bg-primary-50 px-2 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 dark:border-primary-600 dark:bg-primary-900/40 dark:text-primary-200 dark:hover:bg-primary-900/60 w-full"
            title="Contactar (próximamente)"
            @click.stop="contactUser(u.id)"
          >
            <MessageCircle class="h-3.5 w-3.5 shrink-0" />
            Contactar
          </button>
        </article>
      </div>
      <p v-if="!loading && !filteredUsers.length" class="py-12 text-center text-slate-500 dark:text-slate-400">
        No hay otros usuarios registrados.
      </p>
    </main>
    <AppFooter />
  </div>

  <UserProfileModal />
</template>
