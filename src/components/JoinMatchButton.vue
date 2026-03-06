<script setup>
import { computed } from 'vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  joined: { type: Boolean, default: false },
  full: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

const label = computed(() => {
  if (props.joined) return 'Bajarme'
  if (props.full) return 'Completo'
  return 'Anotarme'
})
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-xl font-medium px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="
      joined
        ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
        : full
          ? 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
          : 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
    "
    :disabled="disabled || full"
    @click="emit('click')"
  >
    <span v-if="loading" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    <span v-else>{{ label }}</span>
  </button>
</template>
