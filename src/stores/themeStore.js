/**
 * Store de tema (claro/oscuro). Persiste en localStorage.
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'futbol-theme'

export const useThemeStore = defineStore('theme', () => {
  const dark = ref(
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY) === 'dark'
      : false
  )

  function toggle() {
    dark.value = !dark.value
  }

  function setDark(value) {
    dark.value = !!value
  }

  watch(
    dark,
    (isDark) => {
      if (typeof document === 'undefined') return
      if (isDark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem(STORAGE_KEY, 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem(STORAGE_KEY, 'light')
      }
    },
    { immediate: true }
  )

  return { dark, toggle, setDark }
})
