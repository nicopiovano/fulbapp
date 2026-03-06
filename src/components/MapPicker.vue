<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
    // { lat, lng }
  },
  placeholder: { type: String, default: 'Buscar dirección o hacer clic en el mapa' },
  height: { type: String, default: '320px' },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const mapContainer = ref(null)
const searchInput = ref(null)
const map = ref(null)
const marker = ref(null)
const searchLoading = ref(false)

const DEFAULT_CENTER = [-34.6037, -58.3816]

function createMarker(lat, lng) {
  return L.marker([lat, lng], {
    icon: L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    }),
  })
}

function initMap() {
  if (!mapContainer.value) return
  const center = props.modelValue
    ? [props.modelValue.lat, props.modelValue.lng]
    : DEFAULT_CENTER
  map.value = L.map(mapContainer.value).setView(center, 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map.value)
  if (props.modelValue) {
    marker.value = createMarker(props.modelValue.lat, props.modelValue.lng).addTo(map.value)
  }
  if (props.readonly) return
  map.value.on('click', (e) => {
    const { lat, lng } = e.latlng
    if (!marker.value) {
      marker.value = createMarker(lat, lng).addTo(map.value)
    } else {
      marker.value.setLatLng([lat, lng])
    }
    emit('update:modelValue', { lat, lng })
  })
}

async function searchAddress() {
  const query = searchInput.value?.value?.trim()
  if (!query) return
  searchLoading.value = true
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { Accept: 'application/json' } }
    )
    const data = await res.json()
    if (data.length && data[0].lat && data[0].lon) {
      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      map.value?.setView([lat, lng], 16)
      if (!marker.value) {
        marker.value = createMarker(lat, lng).addTo(map.value)
      } else {
        marker.value.setLatLng([lat, lng])
      }
      emit('update:modelValue', { lat, lng })
    }
  } catch { /* ignore */ } finally {
    searchLoading.value = false
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (!map.value || !val) return
    if (marker.value) {
      marker.value.setLatLng([val.lat, val.lng])
    } else {
      marker.value = createMarker(val.lat, val.lng).addTo(map.value)
    }
    map.value.setView([val.lat, val.lng], map.value.getZoom())
  },
  { deep: true }
)

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  map.value?.remove()
  map.value = null
  marker.value = null
})
</script>

<template>
  <div class="MapPicker">
    <div v-if="!readonly" class="relative mb-2">
      <input
        ref="searchInput"
        type="text"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        :placeholder="placeholder"
        @keydown.enter.prevent="searchAddress"
      />
      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        :disabled="searchLoading"
        aria-label="Buscar"
        @click="searchAddress"
      >
        <span v-if="searchLoading" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <Search v-else class="h-4 w-4" />
      </button>
    </div>
    <div
      ref="mapContainer"
      class="rounded-card border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700/30"
      :style="{ height }"
    />
  </div>
</template>
