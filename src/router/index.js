import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Study from '../views/Study.vue'
import Life from '../views/Life.vue'
import Club from '../views/Club.vue'
import Health from '../views/Health.vue'
import Tools from '../views/Tools.vue'
import Assistant from '../views/Assistant.vue'
import Settings from '../views/Settings.vue'
import Login from '../views/Login.vue'

const routes = [
  { path: '/login', name: 'login', component: Login },
  { path: '/', name: 'home', component: Home },
  { path: '/study', name: 'study', component: Study },
  { path: '/life', name: 'life', component: Life },
  { path: '/club', name: 'club', component: Club },
  { path: '/health', name: 'health', component: Health },
  { path: '/tools', name: 'tools', component: Tools },
  { path: '/assistant', name: 'assistant', component: Assistant },
  { path: '/settings', name: 'settings', component: Settings },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authData = localStorage.getItem('xzitapp_auth')
  let isLoggedIn = false
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      isLoggedIn = !!parsed.currentUser
    } catch (e) {
      // ignore
    }
  }
  if (!isLoggedIn && to.name !== 'login') {
    return { name: 'login' }
  }
  if (isLoggedIn && to.name === 'login') {
    return { name: 'home' }
  }
})

export default router