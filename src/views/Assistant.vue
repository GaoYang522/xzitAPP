<script setup>
import { ref } from 'vue'
import { MessageSquare, Bot, KeyRound, History, List } from 'lucide-vue-next'
import AgentList from '../components/assistant/AgentList.vue'
import AgentDetail from '../components/assistant/AgentDetail.vue'
import ApiConfig from '../components/assistant/ApiConfig.vue'
import ChatInterface from '../components/assistant/ChatInterface.vue'
import HistoryList from '../components/assistant/HistoryList.vue'
import { useAssistantStore } from '../stores/assistant.js'

const store = useAssistantStore()

const activeTab = ref('chat')
const selectedAgent = ref(null)

const tabs = [
  { id: 'chat', label: '对话', icon: MessageSquare },
  { id: 'agents', label: 'Agent 列表', icon: List },
  { id: 'config', label: 'API 配置', icon: KeyRound },
  { id: 'history', label: '历史', icon: History },
]

function onSelectAgent(agent) {
  selectedAgent.value = agent
}
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
      <Bot class="w-7 h-7 text-purple-500" />
      我的助手
    </h1>

    <div class="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="activeTab === tab.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700'"
        class="flex items-center gap-1.5 px-4 py-2 border-b-2 transition-colors"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <div v-show="activeTab === 'chat'">
      <ChatInterface />
    </div>

    <div v-show="activeTab === 'agents'">
      <AgentList @select="onSelectAgent" />
    </div>

    <div v-show="activeTab === 'config'">
      <ApiConfig />
    </div>

    <div v-show="activeTab === 'history'">
      <HistoryList />
    </div>

    <AgentDetail :agent="selectedAgent" @close="selectedAgent = null" />
  </div>
</template>