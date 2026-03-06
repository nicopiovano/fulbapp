<script setup>
defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: String, default: 'md' },
})

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-xl',
}
</script>

<template>
  <div
    class="inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300 overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-700 shadow-sm"
    :class="sizeClasses[size] || sizeClasses.md"
  >
    <img v-if="src" :src="src" :alt="name" class="w-full h-full object-cover" />
    <span v-else class="font-medium">{{ (name || '?').charAt(0).toUpperCase() }}</span>
  </div>
</template>
