<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: true },
  title: { type: String, default: '' },
  fullscreen: { type: Boolean, default: false },
  bottomSheet: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

function handleEscape(e) {
  if (e.key === 'Escape') emit('close')
}

function onBackdropClick(e) {
  if (e.target === e.currentTarget) emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  document.body.style.overflow = 'hidden'
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
        @click.self="onBackdropClick"
      >
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div
          class="relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col rounded-modal bg-white shadow-modal overflow-hidden dark:bg-slate-800 dark:border dark:border-slate-700"
          :class="{
            'max-w-2xl': !fullscreen && !bottomSheet,
            'max-h-[85vh] md:max-h-[90vh]': bottomSheet,
            'rounded-b-none md:rounded-b-modal md:max-h-[85vh]': bottomSheet,
            'fixed bottom-0 left-0 right-0 md:inset-auto md:max-h-[90vh]': bottomSheet,
            'w-full h-full max-w-none max-h-none rounded-none': fullscreen,
          }"
          role="dialog"
          aria-modal="true"
          :aria-label="title || 'Modal'"
        >
          <header
            v-if="title"
            class="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-600 px-4 py-3"
          >
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">{{ title }}</h2>
            <button
              type="button"
              class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Cerrar"
              @click="emit('close')"
            >
              <span class="text-xl leading-none">×</span>
            </button>
          </header>
          <div class="flex-1 overflow-y-auto safe-bottom">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.25s ease;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: translateY(20px);
}
</style>
