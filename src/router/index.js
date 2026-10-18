import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Study from '../views/Study.vue'
import Life from '../views/Life.vue'
import Club from '../views/Club.vue'
import Health from '../views/Health.vue'
import Tools from '../views/Tools.vue'
import Settings from '../views/Settings.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/study', name: 'study', component: Study },
  { path: '/life', name: 'life', component: Life },
  { path: '/club', name: 'club', component: Club },
  { path: '/health', name: 'health', component: Health },
  { path: '/tools', name: 'tools', component: Tools },
  { path: '/settings', name: 'settings', component: Settings },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router