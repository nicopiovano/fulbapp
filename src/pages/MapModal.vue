<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { storeToRefs } from 'pinia'
import { formatMatchDate } from '@/utils/formatDate'
import { formatPrice } from '@/utils/formatPrice'
import { useMatchStore } from '@/stores/matchStore'
import { useUIStore } from '@/stores/uiStore'
import BaseModal from '@/components/BaseModal.vue'

const uiStore = useUIStore()
const matchStore = useMatchStore()
const { matches } = storeToRefs(matchStore)

const mapContainer = ref(null)
const selectedMatchId = ref(null)
const map = ref(null)
const markers = ref([])

const matchesWithLocation = computed(() =>
  matches.value.filter((m) => m.location?.lat != null && m.location?.lng != null)
)

const show = computed(() => uiStore.isMapOpen)

const DEFAULT_CENTER = [-34.6037, -58.3816]

function createMarkerIcon() {
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  })
}

function initMap() {
  if (!mapContainer.value || map.value) return
  map.value = L.map(mapContainer.value).setView(DEFAULT_CENTER, 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map.value)
  markers.value = matchesWithLocation.value.map((m) => {
    const marker = L.marker([m.location.lat, m.location.lng], { icon: createMarkerIcon() })
      .addTo(map.value)
      .bindPopup(
        `<div class="min-w-[160px]">
          <p class="font-semibold text-slate-800">${m.placeName}</p>
          <p class="text-sm text-slate-500">${formatMatchDate(m.date, m.time)}</p>
          ${m.price ? `<p class="text-sm font-medium text-slate-700">${formatPrice(m.price)}</p>` : ''}
          <p class="text-xs text-slate-500">${m.playerIds?.length ?? 0}/${m.maxPlayers} jugadores</p>
        </div>`
      )
    marker.on('click', () => {
      selectedMatchId.value = m.id
    })
    return marker
  })
  if (matchesWithLocation.value.length === 1) {
    map.value.setView(
      [matchesWithLocation.value[0].location.lat, matchesWithLocation.value[0].location.lng],
      14
    )
  } else   if (matchesWithLocation.value.length > 1) {
    const bounds = L.latLngBounds(
      matchesWithLocation.value.map((m) => [m.location.lat, m.location.lng])
    )
    map.value.fitBounds(bounds, { padding: [30, 30] })
  }
  setTimeout(() => map.value?.invalidateSize(), 100)
}

function destroyMap() {
  markers.value.forEach((m) => m.remove())
  markers.value = []
  map.value?.remove()
  map.value = null
}

watch(
  show,
  async (visible) => {
    if (visible) {
      await nextTick()
      initMap()
    } else {
      destroyMap()
    }
  },
  { immediate: true }
)

watch(
  () => matchesWithLocation.value,
  () => {
    if (show.value && map.value) {
      markers.value.forEach((m) => m.remove())
      markers.value = matchesWithLocation.value.map((m) => {
        const marker = L.marker([m.location.lat, m.location.lng], { icon: createMarkerIcon() })
          .addTo(map.value)
          .bindPopup(
            `<div class="min-w-[160px]">
              <p class="font-semibold text-slate-800">${m.placeName}</p>
              <p class="text-sm text-slate-500">${formatMatchDate(m.date, m.time)}</p>
              ${m.price ? `<p class="text-sm font-medium text-slate-700">${formatPrice(m.price)}</p>` : ''}
              <p class="text-xs text-slate-500">${m.playerIds?.length ?? 0}/${m.maxPlayers} jugadores</p>
            </div>`
          )
        marker.on('click', () => {
          selectedMatchId.value = m.id
        })
        return marker
      })
    }
  },
  { deep: true }
)

onUnmounted(() => {
  destroyMap()
})

function openDetail(id) {
  uiStore.closeModal()
  nextTick(() => {
    uiStore.openMatchDetail(id)
  })
}
</script>

<template>
  <BaseModal
    :show="show"
    title="Mapa de partidos"
    fullscreen
    @close="uiStore.closeModal()"
  >
    <div class="flex h-full flex-col md:flex-row">
      <div
        ref="mapContainer"
        class="h-64 flex-shrink-0 md:h-full md:w-1/2"
      />
      <div class="flex-1 overflow-y-auto border-t border-slate-200 dark:border-slate-600 p-4 md:border-t-0 md:border-l">
        <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">Partidos disponibles</p>
        <div class="space-y-3">
          <div
            v-for="m in matches"
            :key="m.id"
            class="cursor-pointer rounded-card border border-slate-200 bg-white p-3 transition hover:border-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-primary-500"
            :class="{ 'ring-2 ring-primary-500': selectedMatchId === m.id }"
            @click="selectedMatchId = m.id"
          >
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ m.placeName }}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ formatMatchDate(m.date, m.time) }}</p>
            <p v-if="m.price" class="text-sm font-medium text-slate-700 dark:text-slate-200">
              {{ formatPrice(m.price) }}
            </p>
            <button
              type="button"
              class="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              @click.stop="openDetail(m.id)"
            >
              Ver detalle
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
