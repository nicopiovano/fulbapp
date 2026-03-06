<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  max: { type: Number, default: 5 },
  size: { type: String, default: 'md' },
  showValue: { type: Boolean, default: false },
})

const fullStars = computed(() => Math.floor(props.value))
const hasHalf = computed(() => props.value % 1 >= 0.5)
const emptyStars = computed(() => props.max - fullStars.value - (hasHalf.value ? 1 : 0))

const sizeClass = computed(() =>
  props.size === 'sm' ? 'w-3.5 h-3.5' : props.size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
)
</script>

<template>
  <div class="inline-flex items-center gap-0.5">
    <template v-for="n in fullStars" :key="'full-' + n">
      <span class="text-amber-400" :class="sizeClass">★</span>
    </template>
    <span v-if="hasHalf" class="text-amber-400" :class="sizeClass">★</span>
    <template v-for="n in emptyStars" :key="'empty-' + n">
      <span class="text-slate-300 dark:text-slate-500" :class="sizeClass">★</span>
    </template>
    <span v-if="showValue" class="ml-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
      {{ value > 0 ? value.toFixed(1) : '—' }}
    </span>
  </div>
</template>
