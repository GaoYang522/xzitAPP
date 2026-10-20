<script setup>
import { useAssistantStore } from '../../stores/assistant.js'
import { History, Trash2, MessageCircle } from 'lucide-vue-next'

const store = useAssistantStore()

function formatTime(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold flex items-center gap-2">
        <History class="w-5 h-5 text-blue-500" />
        对话历史
      </h3>
      <button
        v-if="store.sessionCount > 0"
        @click="store.clearAllSessions()"
        class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
      >
        <Trash2 class="w-4 h-4" />
        清空全部
      </button>
    </div>

    <div v-if="store.sessionCount === 0" class="text-center py-10 text-gray-400">
      <History class="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>暂无对话历史</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="session in store.sessions"
        :key="session.id"
        @click="store.setCurrentSession(session.id)"
        :class="session.id === store.currentSessionId ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'"
        class="cursor-pointer rounded-xl2 border p-4 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-2 flex-1 min-w-0">
            <MessageCircle class="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <div class="min-w-0">
              <p class="font-medium text-sm truncate">{{ session.title }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatTime(session.updatedAt) }} · {{ session.messages.length }} 条消息</p>
            </div>
          </div>
          <button
            @click.stop="store.deleteSession(session.id)"
            class="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>