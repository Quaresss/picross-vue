import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LevelsPage from '../pages/LevelsPage.vue'
import GamePage from '../pages/GamePage.vue'
import FaqPage from '../pages/FaqPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  {
    path: '/world/:worldId/levels',
    name: 'Levels',
    component: LevelsPage,
    props: true,
  },
  {
    path: '/world/:worldId/game/:levelId',
    name: 'Game',
    component: GamePage,
    props: true,
  },
  { path: '/faq', name: 'Faq', component: FaqPage },
  { path: '/levels', redirect: '/world/1/levels' },
  { path: '/game/:levelId', redirect: (to) => `/world/1/game/${to.params.levelId}` },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
