<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/authStore";
import { useMatchStore } from "@/stores/matchStore";
import { useUIStore } from "@/stores/uiStore";
import {
  MATCH_TYPES,
  FIELD_SURFACE_TYPES,
  ESTABLISHMENT_COVERED,
  ESTABLISHMENT_AMENITIES,
  MATCH_GENDERS,
} from "@/types";
import BaseModal from "@/components/BaseModal.vue";
import LocationAutocomplete from "@/components/LocationAutocomplete.vue";
import MapPicker from "@/components/MapPicker.vue";

const uiStore = useUIStore();
const authStore = useAuthStore();
const matchStore = useMatchStore();
const { currentUser, isAuthenticated } = storeToRefs(authStore);
const { modal, modalPayload, isCreateMatchOpen } = storeToRefs(uiStore);

const form = ref({
  type: "f5",
  date: "",
  time: "18:00",
  placeName: "",
  description: "",
  price: null,
  difficulty: 5,
  location: null,
  fieldSurface: "",
  establishmentCovered: "",
  establishmentAmenities: [],
  matchGender: "mixto",
});
const submitting = ref(false);
const error = ref("");
const triedSubmit = ref(false);
const editingMatchId = ref(/** @type {string | null} */ (null));

const maxPlayers = computed(
  () => MATCH_TYPES[form.value.type]?.maxPlayers ?? 10,
);
const typeOptions = computed(() =>
  Object.entries(MATCH_TYPES).map(([value, { label }]) => ({ value, label })),
);
const fieldSurfaceOptions = computed(() => [
  { value: "", label: "Sin especificar" },
  ...Object.entries(FIELD_SURFACE_TYPES).map(([value, { label }]) => ({
    value,
    label,
  })),
]);
const establishmentCoveredOptions = computed(() => [
  { value: "", label: "Sin especificar" },
  ...Object.entries(ESTABLISHMENT_COVERED).map(([value, { label }]) => ({
    value,
    label,
  })),
]);
const establishmentAmenityOptions = computed(() =>
  Object.entries(ESTABLISHMENT_AMENITIES).map(([value, { label }]) => ({
    value,
    label,
  })),
);
const matchGenderOptions = computed(() =>
  Object.entries(MATCH_GENDERS).map(([value, { label }]) => ({ value, label })),
);

const difficultyAccentClass = computed(() => {
  const d = form.value.difficulty ?? 0;
  if (d <= 3) return "accent-red-500";
  if (d <= 5) return "accent-orange-500";
  if (d <= 8) return "accent-yellow-400";
  return "accent-green-500";
});

const difficultyTextClass = computed(() => {
  const d = form.value.difficulty ?? 0;
  if (d <= 3) return "text-red-600 dark:text-red-400";
  if (d <= 5) return "text-orange-600 dark:text-orange-400";
  if (d <= 8) return "text-yellow-600 dark:text-yellow-300";
  return "text-emerald-600 dark:text-emerald-400";
});

async function setAddressFromCoords(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { Accept: "application/json" } }
    );
    const data = await res.json();
    if (data?.display_name) {
      form.value.location = { ...form.value.location, lat, lng, label: data.display_name };
    }
  } catch {
    form.value.location = { ...form.value.location, lat, lng };
  }
}

function onMapLocationSelect(loc) {
  if (loc?.lat == null || loc?.lng == null) return;
  form.value.location = { lat: loc.lat, lng: loc.lng };
  setAddressFromCoords(loc.lat, loc.lng);
}

function resetForm() {
  form.value = {
    type: "f5",
    date: "",
    time: "18:00",
    placeName: "",
    description: "",
    price: null,
    difficulty: 5,
    location: null,
    fieldSurface: "",
    establishmentCovered: "",
    establishmentAmenities: [],
    matchGender: "mixto",
  };
  triedSubmit.value = false;
  error.value = "";
  editingMatchId.value = null;
}

function fillFormFromMatch(m) {
  if (!m) return;
  const loc = m.location;
  const hasCoords = loc && typeof loc.lat === "number" && typeof loc.lng === "number";
  form.value = {
    type: m.type ?? "f5",
    date: m.date ? String(m.date).slice(0, 10) : "",
    time: m.time ? String(m.time).slice(0, 5) : "18:00",
    placeName: m.placeName ?? "",
    description: m.description ?? "",
    price: m.price != null ? Number(m.price) : null,
    difficulty: m.difficulty != null ? Math.min(10, Math.max(1, Number(m.difficulty))) : 5,
    location: hasCoords
      ? {
          lat: loc.lat,
          lng: loc.lng,
          label: m.address || loc.label || "",
        }
      : null,
    fieldSurface: m.fieldSurface ?? "",
    establishmentCovered: m.establishmentCovered ?? "",
    establishmentAmenities: Array.isArray(m.establishmentAmenities)
      ? [...m.establishmentAmenities]
      : [],
    matchGender: m.matchGender ?? "mixto",
  };
}

function toggleAmenity(value) {
  const arr = form.value.establishmentAmenities || [];
  const next = arr.includes(value)
    ? arr.filter((a) => a !== value)
    : [...arr, value];
  form.value.establishmentAmenities = next;
}

async function submit() {
  if (!isAuthenticated.value) {
    uiStore.closeModal();
    uiStore.openLogin();
    return;
  }
  triedSubmit.value = true;
  if (
    !form.value.date ||
    !form.value.time ||
    !form.value.placeName.trim() ||
    !form.value.location
  ) {
    // Solo marcamos en rojo los campos requeridos
    return;
  }
  error.value = "";
  submitting.value = true;
  const payload = {
    type: form.value.type,
    maxPlayers: maxPlayers.value,
    date: form.value.date,
    time: form.value.time,
    placeName: form.value.placeName.trim(),
    description: form.value.description.trim() || undefined,
    price: form.value.price ? Number(form.value.price) : null,
    difficulty: Math.min(10, Math.max(1, form.value.difficulty)),
    location: form.value.location,
    fieldSurface: form.value.fieldSurface || undefined,
    establishmentCovered: form.value.establishmentCovered || undefined,
    establishmentAmenities: Array.isArray(form.value.establishmentAmenities)
      ? form.value.establishmentAmenities
      : [],
    matchGender: form.value.matchGender || "mixto",
  };
  try {
    if (editingMatchId.value) {
      await matchStore.updateMatch(editingMatchId.value, payload);
      uiStore.closeModal();
      resetForm();
    } else {
      await matchStore.createMatch(payload);
      uiStore.closeModal();
      resetForm();
    }
  } catch (e) {
    error.value = e?.message || "Error al guardar partido";
  } finally {
    submitting.value = false;
  }
}

watch(
  [isCreateMatchOpen, modalPayload],
  async ([open, payload]) => {
    if (!open) {
      resetForm();
      return;
    }
    const matchId = payload?.matchId;
    if (matchId) {
      editingMatchId.value = matchId;
      const m = await matchStore.fetchMatchById(matchId);
      await nextTick();
      fillFormFromMatch(m);
    } else {
      editingMatchId.value = null;
      resetForm();
    }
  },
  { immediate: true }
);

const show = computed(() => isCreateMatchOpen.value);
const modalTitle = computed(() =>
  editingMatchId.value ? "Editar partido" : "Crear partido"
);
</script>

<template>
  <BaseModal :show="show" :title="modalTitle" @close="uiStore.closeModal()">
    <form class="p-4 space-y-4" @submit.prevent="submit">
      <div>
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >Tipo de partido</label
        >
        <select
          v-model="form.type"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option
            v-for="opt in typeOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Máximo {{ maxPlayers }} jugadores
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Fecha *</label
          >
          <input
            v-model="form.date"
            type="date"
            :class="[
              'w-full rounded-lg border px-3 py-2 text-sm focus:ring-1',
              'dark:bg-slate-700 dark:text-slate-200',
              !triedSubmit || form.date
                ? 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500'
                : 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500',
            ]"
          />
        </div>
        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Hora *</label
          >
          <input
            v-model="form.time"
            type="time"
            :class="[
              'w-full rounded-lg border px-3 py-2 text-sm focus:ring-1',
              'dark:bg-slate-700 dark:text-slate-200',
              !triedSubmit || form.time
                ? 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500'
                : 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500',
            ]"
          />
        </div>
      </div>

      <div>
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >Nivel del partido (1-10)</label
        >
        <input
          v-model.number="form.difficulty"
          type="range"
          min="1"
          max="10"
          :class="[
            'w-full h-2 rounded-lg appearance-none bg-slate-200 dark:bg-slate-600',
            difficultyAccentClass,
          ]"
        />
        <p class="text-sm" :class="difficultyTextClass">
          Nivel {{ form.difficulty }}
        </p>
      </div>

      <!-- Tipo/Establecimiento/Género en la misma fila -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Tipo de cancha</label
          >
          <select
            v-model="form.fieldSurface"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option
              v-for="opt in fieldSurfaceOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Establecimiento</label
          >
          <select
            v-model="form.establishmentCovered"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option
              v-for="opt in establishmentCoveredOptions"
              :key="opt.value === '' ? 'none' : opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Género del partido</label
          >
          <select
            v-model="form.matchGender"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option
              v-for="opt in matchGenderOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Amenities debajo del bloque de establecimiento -->
      <div class="mt-2 flex flex-wrap gap-3">
        <label
          v-for="opt in establishmentAmenityOptions"
          :key="opt.value"
          class="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300"
        >
          <input
            type="checkbox"
            :checked="(form.establishmentAmenities || []).includes(opt.value)"
            class="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            @change="toggleAmenity(opt.value)"
          />
          {{ opt.label }}
        </label>
      </div>

      <!-- Nombre del lugar y precio en la misma fila -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Nombre del lugar *</label
          >
          <input
            v-model="form.placeName"
            type="text"
            placeholder="Ej: Cancha Los Andes"
            :class="[
              'w-full rounded-lg border px-3 py-2 text-sm focus:ring-1',
              'dark:bg-slate-700 dark:text-slate-200',
              !triedSubmit || form.placeName.trim()
                ? 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500'
                : 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500',
            ]"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Precio de la cancha (opcional)</label
          >
          <input
            v-model.number="form.price"
            type="number"
            min="0"
            placeholder="Ej: 15000"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >Descripción (opcional)</label
        >
        <textarea
          v-model="form.description"
          rows="2"
          placeholder="Partido tranqui, buena onda..."
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label
          :class="[
            'block text-sm font-medium mb-1',
            !triedSubmit || form.location
              ? 'text-slate-700 dark:text-slate-300'
              : 'text-red-600 dark:text-red-400',
          ]"
          >Ubicación *</label
        >
        <LocationAutocomplete
          v-model="form.location"
          placeholder="Buscar dirección..."
        />
        <div class="mt-2 overflow-hidden rounded-lg">
          <MapPicker
            :model-value="form.location"
            :hide-search="true"
            :height="'240px'"
            @update:model-value="onMapLocationSelect"
          />
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </p>

      <div class="flex gap-3 pt-2">
        <button
          type="button"
          class="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          @click="uiStore.closeModal()"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="flex-1 rounded-xl bg-primary px-4 py-3 font-medium text-white hover:bg-primary-600 dark:bg-primary-500 disabled:opacity-50"
          :disabled="submitting"
        >
          {{ submitting ? "Guardando…" : (editingMatchId ? "Guardar cambios" : "Crear partido") }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
