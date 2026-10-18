<script setup>
import { useRouter } from 'vue-router'
import AppCard from '../common/AppCard.vue'

const router = useRouter()

const actions = [
  { label: '添加课程', icon: '📚', path: '/study', color: 'bg-grad-blue' },
  { label: '添加待办', icon: '✅', path: '/tools', color: 'bg-grad-green' },
  { label: '今日打卡', icon: '📝', path: '/health', color: 'bg-grad-purple' },
  { label: '记一笔消费', icon: '💳', path: '/life', color: 'bg-grad-orange' },
]
</script>

<template>
  <AppCard>
    <h3 class="font-semibold text-gray-800 dark:text-white mb-3">⚡ 快捷入口</h3>
    <div class="grid grid-cols-4 gap-3">
      <button
        v-for="action in actions"
        :key="action.label"
        @click="router.push(action.path)"
        :class="['p-3 rounded-xl text-center transition-all hover:scale-105', action.color]"
      >
        <div class="text-2xl mb-1">{{ action.icon }}</div>
        <div class="text-xs text-white font-medium">{{ action.label }}</div>
      </button>
    </div>
  </AppCard>
</template>