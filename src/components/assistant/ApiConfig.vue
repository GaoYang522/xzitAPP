<script setup>
import { ref } from 'vue'
import { useAssistantStore } from '../../stores/assistant.js'
import { KeyRound, CheckCircle2, XCircle, Loader2, Link } from 'lucide-vue-next'

const store = useAssistantStore()

const testing = ref(false)
const testResult = ref(null)

async function testConnection() {
  testing.value = true
  testResult.value = null
  const result = await store.testApiConnectivity()
  testResult.value = result
  testing.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl2 shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <KeyRound class="w-5 h-5 text-blue-500" />
        LLM API 配置
      </h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm text-gray-500 mb-1">LLM 提供商</label>
          <select
            v-model="store.apiConfig.llmProvider"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">API Key</label>
          <input
            v-model="store.apiConfig.llmApiKey"
            type="password"
            placeholder="sk-..."
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">Base URL</label>
          <input
            v-model="store.apiConfig.llmBaseUrl"
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">模型名</label>
          <input
            v-model="store.apiConfig.llmModel"
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
          />
        </div>
        <button
          @click="testConnection"
          :disabled="testing"
          class="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <Loader2 v-if="testing" class="w-4 h-4 animate-spin" />
          <span>{{ testing ? '测试中...' : '测试连通性' }}</span>
        </button>
        <div v-if="testResult" class="flex items-center gap-2 text-sm">
          <CheckCircle2 v-if="testResult.success" class="w-4 h-4 text-green-500" />
          <XCircle v-else class="w-4 h-4 text-red-500" />
          <span :class="testResult.success ? 'text-green-600' : 'text-red-500'">{{ testResult.message }}</span>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl2 shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <Link class="w-5 h-5 text-purple-500" />
        在线编译 API 配置
      </h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm text-gray-500 mb-1">API URL</label>
          <input
            v-model="store.apiConfig.compileApiUrl"
            type="text"
            placeholder="https://judge0.example.com"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">API Key（可选）</label>
          <input
            v-model="store.apiConfig.compileApiKey"
            type="password"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
          />
        </div>
      </div>
    </div>
  </div>
</template>