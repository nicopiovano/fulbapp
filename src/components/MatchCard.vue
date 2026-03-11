<script setup>
import { computed } from "vue";
import {
  MATCH_TYPES,
  FIELD_SURFACE_TYPES,
  ESTABLISHMENT_COVERED,
  ESTABLISHMENT_AMENITIES,
  MATCH_GENDERS,
} from "@/types";
import { formatMatchDate } from "@/utils/formatDate";
import { isMatchPast as checkMatchPast } from "@/utils/matchDate";
import { formatPrice } from "@/utils/formatPrice";
import { useUIStore } from "@/stores/uiStore";
import DifficultyBadge from "./DifficultyBadge.vue";
import PlayerAvatar from "./PlayerAvatar.vue";
import MatchDetails from "./MatchDetails.vue";
import MatchActionButton from "./MatchActionButton.vue";

const uiStore = useUIStore();

const props = defineProps({
  match: {
    type: Object,
    required: true,
    // Match + optional distanceKm, players (User[])
  },
  players: { type: Array, default: () => [] },
  currentUserId: { type: String, default: "" },
  distanceKm: { type: Number, default: null },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["click", "join", "leave", "cancel", "rate"]);

const typeLabel = computed(
  () => MATCH_TYPES[props.match.type]?.label ?? props.match.type,
);
const count = computed(() => props.match.playerIds?.length ?? 0);
const capacity = computed(
  () => props.match.openSlots ?? props.match.maxPlayers ?? 0,
);
const slotsLeft = computed(() =>
  Math.max((capacity.value || 0) - (count.value || 0), 0),
);
const isFull = computed(
  () => capacity.value > 0 && count.value >= capacity.value,
);
const isJoined = computed(
  () =>
    props.currentUserId && props.match.playerIds?.includes(props.currentUserId),
);
const displayDistance = computed(() => {
  if (props.distanceKm == null) return null;
  if (props.distanceKm < 1) return `${Math.round(props.distanceKm * 1000)} m`;
  return `${props.distanceKm.toFixed(1)} km`;
});

const isCompetitive = computed(() => props.match.difficulty >= 8);
const isAlmostFull = computed(
  () =>
    capacity.value > 0 && count.value >= capacity.value - 2 && !isFull.value,
);
const isMatchPast = computed(() =>
  checkMatchPast(props.match?.date, props.match?.time),
);
const isToday = computed(() => {
  if (!props.match?.date) return false;
  const [y, m, d] = props.match.date.split("-").map(Number);
  const matchDate = new Date(y || 0, (m || 1) - 1, d || 1);
  const now = new Date();
  return (
    matchDate.getFullYear() === now.getFullYear() &&
    matchDate.getMonth() === now.getMonth() &&
    matchDate.getDate() === now.getDate()
  );
});
const displayDate = computed(() =>
  formatMatchDate(props.match.date, props.match.time),
);
const displayPrice = computed(() => formatPrice(props.match.price));
const playersTooltip = (player) => {
  const parts = [];
  if (player.name) parts.push(player.name);
  if (player.position) parts.push(player.position);
  if (player.ratings?.habilidad)
    parts.push(`Nivel: ${player.ratings.habilidad.toFixed(1)}/5`);
  return parts.join(" · ");
};

const buttonState = computed(() => {
  if (props.match?.cancelled) return "cancelled";
  if (isMatchPast.value) return "past";
  if (isCreator.value) return "cancel";
  if (isJoined.value) return "leave";
  if (isFull.value) return "full";
  return "join";
});

const isCreator = computed(() => props.match?.isCreator ?? false);

const canRatePlayers = computed(
  () => props.match?.hasPendingRatings !== false,
);

function handlePrimaryActionClick() {
  if (buttonState.value === "join") {
    emit("join");
  } else if (buttonState.value === "leave") {
    emit("leave");
  } else if (buttonState.value === "cancel") {
    emit("cancel");
  }
}

function handleEditClick() {
  if (!props.match?.id) return;
  uiStore.openCreateMatch(props.match.id);
}
</script>

<template>
  <article
    class="group flex h-full flex-col rounded-card border border-slate-200 bg-white p-3 shadow-card cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500 dark:hover:shadow-primary-500/5"
    :class="{
      'border-amber-300 dark:border-amber-400 shadow-lg shadow-amber-500/10':
        !isMatchPast && (isToday || slotsLeft <= 2),
    }"
    @click="emit('click')"
  >
    <div class="flex flex-1 flex-col">
      <MatchDetails
        :type-label="typeLabel"
        :difficulty="match.difficulty"
        :is-today="isToday"
        :is-competitive="isCompetitive"
        :slots-left="slotsLeft"
        :is-match-past="isMatchPast"
        :is-almost-full="isAlmostFull"
        :is-full="isFull"
      />

      <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {{ match.placeName }}
      </p>
      <p
        v-if="match.neighborhood"
        class="text-xs text-slate-500 dark:text-slate-400"
      >
        {{ match.neighborhood }}
      </p>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {{ displayDate }}
      </p>
      <p
        v-if="displayPrice"
        class="text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {{ displayPrice }}
      </p>

      <!-- Bloque de capacidad fijo en la parte inferior del contenido -->
      <div class="mt-auto space-y-1 pt-2">
        <template v-if="!isMatchPast">
          <div
            class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300"
          >
            <span v-if="slotsLeft > 0"
              >Falta{{ slotsLeft === 1 ? "" : "n" }} {{ slotsLeft }} jugador{{
                slotsLeft === 1 ? "" : "es"
              }}</span
            >
            <span v-else class="font-medium text-red-500 dark:text-red-300"
              >Partido completo</span
            >
            <span class="text-[11px] text-slate-500 dark:text-slate-400">
              {{ count }} / {{ capacity || 0 }}
            </span>
          </div>
          <div
            class="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
          >
            <div
              class="h-full rounded-full bg-primary-500 transition-all"
              :style="{
                width: `${Math.min(
                  capacity ? (count / capacity) * 100 : 0,
                  100,
                )}%`,
              }"
            />
          </div>
          <p
            v-if="displayDistance"
            class="text-xs text-slate-500 dark:text-slate-400"
          >
            📍 ~ {{ displayDistance }}
          </p>
        </template>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center justify-end gap-2" @click.stop>
      <!-- Partido pasado, no cancelado, soy el creador y quedan jugadores por calificar -->
      <button
        v-if="isMatchPast && !match.cancelled && isCreator && canRatePlayers"
        type="button"
        class="inline-flex min-w-[7rem] items-center justify-center rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
        @click.stop="emit('rate')"
      >
        Puntuar Jugadores
      </button>
      <!-- Partido futuro, soy el creador → editar -->
      <button
        v-if="isCreator && !match.cancelled && !isMatchPast"
        type="button"
        class="inline-flex min-w-[7rem] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        @click.stop="handleEditClick"
      >
        Editar
      </button>
      <MatchActionButton
        v-if="!isMatchPast || match.cancelled"
        :state="buttonState"
        :loading="loading"
        @click="handlePrimaryActionClick()"
      />
    </div>
  </article>
</template>
