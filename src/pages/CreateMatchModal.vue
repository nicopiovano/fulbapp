<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useMatchStore } from '@/stores/matchStore'
import { useUIStore } from '@/stores/uiStore'
import { MATCH_TYPES } from '@/types'
import BaseModal from '@/components/BaseModal.vue'
import MapPicker from '@/components/MapPicker.vue'

const uiStore = useUIStore()
const authStore = useAuthStore()
const matchStore = useMatchStore()
const { currentUser, isAuthenticated } = storeToRefs(authStore)

const form = ref({
  type: 'f5',
  date: '',
  time: '18:00',
  placeName: '',
  description: '',
  price: null,
  difficulty: 5,
  location: null,
})
const submitting = ref(false)
const error = ref('')

const maxPlayers = computed(() => MATCH_TYPES[form.value.type]?.maxPlayers ?? 10)
const typeOptions = computed(() => Object.entries(MATCH_TYPES).map(([value, { label }]) => ({ value, label })))

async function submit() {
  if (!isAuthenticated.value) {
    uiStore.closeModal()
    uiStore.openLogin()
    return
  }
  error.value = ''
  if (!form.value.placeName.trim()) {
    error.value = 'Nombre del lugar es obligatorio'
    return
  }
  if (!form.value.location) {
    error.value = 'Selecciona la ubicación en el mapa'
    return
  }
  submitting.value = true
  try {
    await matchStore.createMatch({
      type: form.value.type,
      maxPlayers: maxPlayers.value,
      date: form.value.date,
      time: form.value.time,
      placeName: form.value.placeName.trim(),
      description: form.value.description.trim() || undefined,
      price: form.value.price ? Number(form.value.price) : null,
      difficulty: Math.min(10, Math.max(1, form.value.difficulty)),
      location: form.value.location,
    })
    uiStore.closeModal()
    form.value = {
      type: 'f5',
      date: '',
      time: '18:00',
      placeName: '',
      description: '',
      price: null,
      difficulty: 5,
      location: null,
    }
  } catch (e) {
    error.value = e?.message || 'Error al crear partido'
  } finally {
    submitting.value = false
  }
}

const show = computed(() => uiStore.isCreateMatchOpen)
</script>

<template>
  <BaseModal
    :show="show"
    title="Crear partido"
    @close="uiStore.closeModal()"
  >
    <form class="p-4 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de partido</label>
        <select
          v-model="form.type"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Máximo {{ maxPlayers }} jugadores</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
          <input
            v-model="form.date"
            type="date"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora</label>
          <input
            v-model="form.time"
            type="time"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nivel del partido (1-10)</label>
        <input
          v-model.number="form.difficulty"
          type="range"
          min="1"
          max="10"
          class="w-full h-2 rounded-lg appearance-none bg-slate-200 dark:bg-slate-600 accent-primary-500"
        />
        <p class="text-sm text-slate-600 dark:text-slate-300">Nivel {{ form.difficulty }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio de la cancha (opcional)</label>
        <input
          v-model.number="form.price"
          type="number"
          min="0"
          placeholder="Ej: 15000"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del lugar *</label>
        <input
          v-model="form.placeName"
          type="text"
          placeholder="Ej: Cancha Los Andes"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción (opcional)</label>
        <textarea
          v-model="form.description"
          rows="2"
          placeholder="Partido tranqui, buena onda..."
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación</label>
        <MapPicker v-model="form.location" :height="'280px'" />
      </div>

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex gap-3 pt-2">
        <button
          type="button"
          class="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          @click="uiStore.closeModal()"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="flex-1 rounded-xl bg-primary px-4 py-3 font-medium text-white hover:bg-primary-600 dark:bg-primary-500 disabled:opacity-50"
          :disabled="submitting"
        >
          {{ submitting ? 'Creando…' : 'Crear partido' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
