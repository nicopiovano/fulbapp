<script setup>
import { computed } from "vue";

const props = defineProps({
  state: {
    type: String,
    default: "join", // 'join' | 'leave' | 'past' | 'cancelled' | 'full'
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

const LABELS = {
  join: "Anotarme",
  leave: "Bajarme",
  past: "Ya jugado",
  cancelled: "Cancelado",
  full: "Completo",
};

const label = computed(() => LABELS[props.state] ?? "Anotarme");

const classes = computed(() => {
  if (props.state === "join") {
    return "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500";
  }
  if (props.state === "leave") {
    return "border border-primary-500 text-primary-600 bg-white hover:bg-primary-50 dark:border-primary-400 dark:text-primary-200 dark:bg-slate-800 dark:hover:bg-slate-700";
  }
  if (
    props.state === "past" ||
    props.state === "cancelled" ||
    props.state === "full"
  ) {
    return "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300 cursor-default";
  }
  return "";
});

const isDisabled = computed(
  () =>
    props.loading ||
    props.state === "past" ||
    props.state === "cancelled",
);
</script>

<template>
  <button
    type="button"
    class="inline-flex min-w-[7rem] items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
    :class="classes"
    :disabled="isDisabled"
    @click="!isDisabled && emit('click')"
  >
    <span
      v-if="loading"
      class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-slate-200 dark:border-t-transparent"
    />
    <span v-else>{{ label }}</span>
  </button>
</template>

