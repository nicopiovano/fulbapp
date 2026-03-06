<script setup>
const PORTFOLIO_URL = 'https://nicolas-piovano-porfolio.vercel.app'
const CREATOR = 'Nicolás Piovano'
</script>

<template>
  <footer
    class="mt-auto border-t border-slate-200 py-6 dark:border-slate-700"
    role="contentinfo"
  >
    <div class="mx-auto max-w-6xl px-4">
      <a
        :href="PORTFOLIO_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <span>Desarrollado por {{ CREATOR }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
  </footer>
</template>
