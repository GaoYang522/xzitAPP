<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAssistantStore } from '../../stores/assistant.js'
import { Bot, Send, Loader2, ExternalLink, Navigation } from 'lucide-vue-next'

const router = useRouter()
const store = useAssistantStore()

const input = ref('')
const loading = ref(false)
const messagesContainer = ref(null)

const recentMessages = computed(() => {
  if (!store.currentSession) return []
  return store.currentSession.messages.slice(-6)
})

async function send() {
  if (!input.value.trim() || loading.value) return
  const text = input.value.trim()
  input.value = ''
  loading.value = true
  try {
    await store.sendMessage(text)
  } finally {
    loading.value = false
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function goToFullChat() {
  router.push('/assistant')
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl2 shadow-sm border border-gray-100 dark:border-gray-700 p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold flex items-center gap-2">
        <Bot class="w-5 h-5 text-purple-500" />
        AI 助手
      </h3>
      <button
        @click="goToFullChat"
        class="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition-colors"
      >
        展开完整对话
        <ExternalLink class="w-3.5 h-3.5" />
      </button>
    </div>

    <div ref="messagesContainer" class="max-h-64 overflow-y-auto space-y-3 mb-3">
      <div v-if="recentMessages.length === 0" class="text-center py-6 text-gray-400 text-sm">
        <Bot class="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p>输入问题，AI 助手自动路由到合适的子 Agent</p>
      </div>
      <template v-for="(msg, i) in recentMessages" :key="i">
        <div :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
          <div
            :class="msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'"
            class="rounded-xl2 px-3 py-2 max-w-[80%] text-sm"
          >
            <div v-if="msg.role === 'assistant' && msg.routeInfo" class="flex items-center gap-1 text-xs text-blue-500 mb-1">
              <Navigation class="w-3 h-3" />
              <span>已路由到：{{ msg.agentName }}</span>
            </div>
            <div class="whitespace-pre-wrap">{{ msg.content }}</div>
          </div>
        </div>
      </template>
    </div>

    <div class="flex gap-2">
      <input
        v-model="input"
        @keydown="handleKeydown"
        placeholder="输入你的问题..."
        class="flex-1 px-4 py-2 rounded-xl2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:border-purple-400"
      />
      <button
        @click="send"
        :disabled="!input.trim() || loading"
        class="px-4 rounded-xl2 bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 transition-colors flex items-center justify-center"
      >
        <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
        <Send v-else class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>