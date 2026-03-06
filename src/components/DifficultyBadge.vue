<script setup>
import { computed } from 'vue'

const props = defineProps({
  level: { type: Number, required: true },
  max: { type: Number, default: 10 },
})

const label = computed(() => `Nivel ${props.level}`)
const colorClass = computed(() => {
  if (props.level <= 3) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
  if (props.level <= 6) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
  return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
    :class="colorClass"
  >
    {{ label }}
  </span>
</template>
