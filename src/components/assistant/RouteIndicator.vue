<script setup>
import { Navigation } from 'lucide-vue-next'

defineProps({
  agentName: { type: String, default: '' },
  method: { type: String, default: '' },
  steps: { type: Array, default: null },
})
</script>

<template>
  <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-sm text-blue-600 dark:text-blue-400 my-2">
    <Navigation class="w-4 h-4 flex-shrink-0" />
    <span v-if="!steps">已路由到：{{ agentName }}</span>
    <span v-else>工作流：{{ steps.map(s => s.agentName || s.agentId).join(' → ') }}</span>
    <span class="text-xs text-blue-400 dark:text-blue-500 ml-auto">({{ method === 'keyword' ? '关键词匹配' : 'AI分析' }})</span>
  </div>
</template>