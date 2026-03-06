<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  label: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

function setValue(n) {
  emit('update:modelValue', n)
}
</script>

<template>
  <div class="flex items-center justify-between gap-2 text-sm">
    <span class="text-slate-600 dark:text-slate-300 min-w-[100px]">{{ label }}</span>
    <div class="flex gap-0.5">
      <button
        v-for="n in 5"
        :key="n"
        type="button"
        class="rounded p-0.5 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500"
        :class="n <= modelValue ? 'text-amber-400' : 'text-slate-300 dark:text-slate-500'"
        @click="setValue(n)"
      >
        ★
      </button>
    </div>
  </div>
</template>
