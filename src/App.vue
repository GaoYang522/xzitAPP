<script setup>
import { watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from './stores/settings'
import { useAuthStore } from './stores/auth'
import { saveUserData } from './utils/userData'
import { Home, BookOpen, Coffee, Users, Heart, Wrench, Bot, Settings, LogOut, User } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const settings = useSettingsStore()
const auth = useAuthStore()

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/study', label: '学业', icon: BookOpen },
  { path: '/life', label: '生活', icon: Coffee },
  { path: '/club', label: '社团', icon: Users },
  { path: '/health', label: '健康', icon: Heart },
  { path: '/tools', label: '工具', icon: Wrench },
  { path: '/assistant', label: '助手', icon: Bot },
  { path: '/settings', label: '设置', icon: Settings },
]

const showNav = computed(() => route.name !== 'login')

function handleLogout() {
  if (auth.currentUser) {
    saveUserData(auth.currentUser)
  }
  auth.logout()
  router.push('/login')
}

watch(
  () => settings.theme,
  (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  },
  { immediate: true }
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <nav
      v-if="showNav"
      class="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 hidden md:block"
    >
      <div class="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div class="flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            :class="
              route.path === item.path
                ? 'bg-grad-blue text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            "
          >
            <component :is="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
            <User class="w-4 h-4" />
            <span>{{ auth.currentUser }}</span>
          </div>
          <button
            @click="settings.toggleTheme()"
            class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-lg"
          >
            {{ settings.theme === 'light' ? '🌙' : '☀️' }}
          </button>
          <button
            @click="handleLogout"
            class="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-500"
            title="登出"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <router-view />
    </main>

    <nav
      v-if="showNav"
      class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden"
    >
      <div class="flex items-center justify-around h-16 overflow-x-auto">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-xs flex-shrink-0 transition-all"
          :class="
            route.path === item.path
              ? 'text-blue-500 font-medium'
              : 'text-gray-400'
          "
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>