<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import BaseModal from '@/components/BaseModal.vue'

const uiStore = useUIStore()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login({ email: email.value, password: password.value })
    uiStore.closeModal()
  } catch (e) {
    error.value = e?.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}

const show = computed(() => uiStore.isLoginOpen)
</script>

<template>
  <BaseModal
    :show="show"
    title="Iniciar sesión"
    @close="uiStore.closeModal()"
  >
    <div class="p-4">
      <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">
        En esta versión la autenticación es simulada. Usa cualquier correo y contraseña para entrar con el usuario de prueba.
      </p>
      <form class="space-y-4" @submit.prevent="login">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo</label>
          <input
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        <button
          type="submit"
          class="w-full rounded-xl bg-primary px-4 py-3 font-medium text-white hover:bg-primary-600 dark:bg-primary-500 disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </div>
  </BaseModal>
</template>
