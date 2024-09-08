import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GameView from '@/views/GameView.vue'

// console.log(import.meta.env.VITE_BACKEND_URL)
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BACKEND_URL),
  routes: [
    {
      name: 'home',
      path: '/',
      component: HomeView
    },
    {
      name: 'about',
      path: '/about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AboutView.vue')
    },
    {
      name: 'game',
      path: '/game',
      component: GameView
    }
  ]
})

export default router
