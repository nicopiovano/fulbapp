<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  placeholder: {
    type: String,
    default: "Buscar dirección",
  },
});

const emit = defineEmits(["update:modelValue"]);

const query = ref(props.modelValue?.label || "");
const results = ref([]);
const loading = ref(false);
const showList = ref(false);

watch(
  () => props.modelValue,
  (val) => {
    if (val && typeof val === "object") {
      query.value = val.label || "";
    } else if (!val) {
      query.value = "";
    }
  },
);

async function search() {
  const q = query.value.trim();
  if (q.length < 3) {
    results.value = [];
    showList.value = false;
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
      { headers: { Accept: "application/json" } },
    );
    const data = await res.json();
    results.value =
      Array.isArray(data) && data.length
        ? data.map((item) => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            label: item.display_name,
          }))
        : [];
    showList.value = results.value.length > 0;
  } catch {
    results.value = [];
    showList.value = false;
  } finally {
    loading.value = false;
  }
}

function onInput() {
  search();
}

function selectResult(item) {
  query.value = item.label;
  showList.value = false;
  results.value = [];
  emit("update:modelValue", item);
}

function onBlur() {
  // Pequeño delay para permitir click en la opción antes de cerrar
  setTimeout(() => {
    showList.value = false;
  }, 150);
}
</script>

<template>
  <div class="relative">
    <input
      v-model="query"
      type="text"
      :placeholder="placeholder"
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
      @input="onInput"
      @focus="search"
      @blur="onBlur"
    />
    <div
      v-if="loading"
      class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"
    />
    <ul
      v-if="showList"
      class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <li
        v-for="item in results"
        :key="`${item.lat}-${item.lng}-${item.label}`"
        class="cursor-pointer px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
        @mousedown.prevent="selectResult(item)"
      >
        {{ item.label }}
      </li>
      <li
        v-if="!results.length && !loading"
        class="px-3 py-2 text-slate-500 dark:text-slate-400"
      >
        No se encontraron resultados
      </li>
    </ul>
  </div>
</template>

