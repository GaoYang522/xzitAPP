<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from './stores/settings'
import { Home, BookOpen, Coffee, Users, Heart, Wrench, Settings } from 'lucide-vue-next'

const route = useRoute()
const settings = useSettingsStore()

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/study', label: '学业', icon: BookOpen },
  { path: '/life', label: '生活', icon: Coffee },
  { path: '/club', label: '社团', icon: Users },
  { path: '/health', label: '健康', icon: Heart },
  { path: '/tools', label: '工具', icon: Wrench },
  { path: '/settings', label: '设置', icon: Settings },
]

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
      class="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700"
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
        <button
          @click="settings.toggleTheme()"
          class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-lg"
        >
          {{ settings.theme === 'light' ? '🌙' : '☀️' }}
        </button>
      </div>
    </nav>
    <main class="max-w-6xl mx-auto px-4 py-6">
      <router-view />
    </main>
  </div>
</template>