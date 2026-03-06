import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useThemeStore } from '@/stores/themeStore'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
useThemeStore() // aplica tema guardado (dark/light)
app.use(router)
app.mount('#app')
