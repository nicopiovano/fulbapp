<script setup>
import { computed } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import RatingStars from './RatingStars.vue'

const props = defineProps({
  title: { type: String, default: 'Equipo' },
  players: {
    type: Array,
    default: () => [],
    // items: { id, name, avatar, skill }
  },
  averageSkill: { type: Number, default: 0 },
})

const displayAvg = computed(() =>
  props.averageSkill > 0 ? props.averageSkill.toFixed(1) : '—'
)
</script>

<template>
  <div class="rounded-card border border-slate-200 bg-white p-4 shadow-card dark:border-slate-600 dark:bg-slate-800">
    <div class="mb-2 flex items-center justify-between">
      <h4 class="font-semibold text-slate-800 dark:text-slate-100">{{ title }}</h4>
      <span class="text-sm text-slate-500 dark:text-slate-400">
        Prom. habilidad: <strong>{{ displayAvg }}</strong>
      </span>
    </div>
    <ul class="space-y-2">
      <li
        v-for="p in players"
        :key="p.id"
        class="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700/50"
      >
        <PlayerAvatar :src="p.avatar" :name="p.name" size="sm" />
        <span class="flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">{{ p.name }}</span>
        <RatingStars :value="p.skill" :max="5" size="sm" show-value />
      </li>
    </ul>
  </div>
</template>
