<script setup>
// SPA: una sola vista principal; el resto son modales/overlays.
</script>

<template>
  <div class="min-h-screen">
    <router-view />
    <!-- Firma / stack -->
    <div
      class="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-4"
    >
      <div
        class="pointer-events-auto max-w-xl rounded-2xl border border-white/10 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-100 shadow-sm backdrop-blur"
      >
        <span class="font-medium">Desarrollado con</span>
        <span class="mx-2 text-zinc-300">
          Vue · Tailwind · Pinia · Leaflet · AI
        </span>
        <a
          href="https://nico-piovano-porfolio.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2 hover:opacity-80"
        >
          <span class="font-medium">by Nico Piovano</span>
        </a>
      </div>
    </div>
  </div>
</template>
