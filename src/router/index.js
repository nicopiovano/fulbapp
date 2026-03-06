import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Users from '@/pages/Users.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/usuarios',
    name: 'Users',
    component: Users,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
