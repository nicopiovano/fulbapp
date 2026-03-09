<script setup>
import DifficultyBadge from "./DifficultyBadge.vue";

const props = defineProps({
  typeLabel: {
    type: String,
    required: true,
  },
  difficulty: {
    type: Number,
    required: true,
  },
  isToday: {
    type: Boolean,
    default: false,
  },
  isCompetitive: {
    type: Boolean,
    default: false,
  },
  slotsLeft: {
    type: Number,
    default: 0,
  },
  isMatchPast: {
    type: Boolean,
    default: false,
  },
  isAlmostFull: {
    type: Boolean,
    default: false,
  },
  isFull: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="mb-2 flex flex-wrap items-center gap-2">
    <span
      class="rounded bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
    >
      {{ typeLabel }}
    </span>
    <DifficultyBadge :level="difficulty" />
    <span
      v-if="isToday"
      class="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
    >
      HOY
    </span>
    <span
      v-if="isCompetitive"
      class="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-800 dark:bg-orange-900/40 dark:text-orange-200"
    >
      Competitivo
    </span>
    <span
      v-if="slotsLeft <= 2 && slotsLeft > 0 && !isMatchPast"
      class="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
    >
      ⚡ Falta{{ slotsLeft === 1 ? "" : "n" }} {{ slotsLeft }} jugador{{
        slotsLeft === 1 ? "" : "es"
      }}
    </span>
    <span
      v-else-if="isAlmostFull"
      class="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
    >
      Casi lleno
    </span>
    <span
      v-if="isFull"
      class="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900/40 dark:text-red-200"
    >
      Lleno
    </span>
  </div>
</template>
