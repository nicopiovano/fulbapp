<script setup>
import { Sun, Moon, Bell } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useThemeStore } from '@/stores/themeStore'
import PlayerAvatar from '@/components/PlayerAvatar.vue'

const uiStore = useUIStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { currentUser, isAuthenticated } = storeToRefs(authStore)
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80">
    <div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
      <div class="flex items-center gap-6">
        <router-link to="/" class="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm">F</span>
          <span class="hidden sm:inline">Fútbol</span>
        </router-link>
        <nav class="hidden md:flex items-center gap-1">
          <router-link
            to="/usuarios"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            Usuarios
          </router-link>
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            @click="uiStore.openCreateMatch()"
          >
            Crear partido
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            @click="uiStore.openMap()"
          >
            Mapa
          </button>
        </nav>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          :aria-label="themeStore.dark ? 'Modo claro' : 'Modo oscuro'"
          :title="themeStore.dark ? 'Modo claro' : 'Modo oscuro'"
          @click="themeStore.toggle()"
        >
          <Sun v-if="themeStore.dark" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Notificaciones"
        >
          <Bell class="h-5 w-5" />
        </button>
        <template v-if="isAuthenticated && currentUser">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            @click="uiStore.openUserProfile(currentUser.id)"
          >
            <PlayerAvatar :src="currentUser.avatar" :name="currentUser.name" size="sm" />
            <span class="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
              {{ currentUser.name }}
            </span>
          </button>
        </template>
        <button
          v-else
          type="button"
          class="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 dark:bg-primary-500 dark:hover:bg-primary-600"
          @click="uiStore.openLogin()"
        >
          Entrar
        </button>
      </div>
    </div>
  </header>
</template>
