import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
useThemeStore()

// Restaurar sesión desde localStorage antes de montar
const authStore = useAuthStore()
authStore.init().finally(() => {
  app.use(router)
  app.mount('#app')
})
