<script setup>
import { ref, computed } from 'vue'
import { MATCH_TYPES, FIELD_SURFACE_TYPES, ESTABLISHMENT_COVERED, ESTABLISHMENT_AMENITIES, MATCH_GENDERS } from '@/types'

const props = defineProps({
  open: { type: Boolean, default: false },
  filters: {
    type: Object,
    default: () => ({
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
    }),
  },
})

const emit = defineEmits(['update:filters', 'close'])

const local = ref({ ...props.filters })

const typeOptions = computed(() => [
  { value: '', label: 'Todos' },
  ...Object.entries(MATCH_TYPES).map(([value, { label }]) => ({ value, label })),
])

function apply() {
  emit('update:filters', { ...local.value })
  emit('close')
}

const fieldSurfaceOptions = computed(() => [
  { value: '', label: 'Cualquiera' },
  ...Object.entries(FIELD_SURFACE_TYPES).map(([value, { label }]) => ({ value, label })),
])
const establishmentCoveredOptions = computed(() => [
  { value: '', label: 'Cualquiera' },
  ...Object.entries(ESTABLISHMENT_COVERED).map(([value, { label }]) => ({ value, label })),
])
const matchGenderOptions = computed(() => [
  { value: '', label: 'Cualquiera' },
  ...Object.entries(MATCH_GENDERS).map(([value, { label }]) => ({ value, label })),
])

function clear() {
  local.value = {
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
  }
  emit('update:filters', { ...local.value })
  emit('close')
}
</script>

<template>
  <Transition name="slide">
    <div
      v-if="open"
      class="fixed inset-y-0 right-0 z-40 w-full max-w-sm border-l border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 md:max-w-xs"
    >
      <div class="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-600 px-4">
        <h3 class="font-semibold text-slate-800 dark:text-slate-100">Filtros</h3>
        <button
          type="button"
          class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          ×
        </button>
      </div>
      <div class="p-4 space-y-4 overflow-y-auto">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
          <select
            v-model="local.type"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nivel mín.</label>
            <input
              v-model.number="local.difficultyMin"
              type="number"
              min="1"
              max="10"
              placeholder="1"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nivel máx.</label>
            <input
              v-model.number="local.difficultyMax"
              type="number"
              min="1"
              max="10"
              placeholder="10"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Desde fecha</label>
          <input
            v-model="local.dateFrom"
            type="date"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hasta fecha</label>
          <input
            v-model="local.dateTo"
            type="date"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de cancha</label>
          <select
            v-model="local.fieldSurface"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            <option v-for="opt in fieldSurfaceOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Establecimiento</label>
          <select
            v-model="local.establishmentCovered"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            <option v-for="opt in establishmentCoveredOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <div class="mt-2 flex flex-wrap gap-3">
            <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300">
              <input v-model="local.hasBuffet" type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              {{ ESTABLISHMENT_AMENITIES.buffet.label }}
            </label>
            <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300">
              <input v-model="local.hasVestuario" type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              {{ ESTABLISHMENT_AMENITIES.vestuario.label }}
            </label>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Género del partido</label>
          <select
            v-model="local.matchGender"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            <option v-for="opt in matchGenderOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="flex gap-2 pt-2">
          <button
            type="button"
            class="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="clear"
          >
            Limpiar
          </button>
          <button
            type="button"
            class="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 dark:bg-primary-500"
            @click="apply"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  </Transition>
  <div
    v-if="open"
    class="fixed inset-0 z-30 bg-slate-900/40 dark:bg-black/50"
    aria-hidden="true"
    @click="emit('close')"
  />
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
