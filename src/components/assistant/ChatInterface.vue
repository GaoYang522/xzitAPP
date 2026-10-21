<script setup>
import { ref, nextTick, computed } from 'vue'
import { useAssistantStore } from '../../stores/assistant.js'
import { Send, Loader2, MessageSquare, Paperclip, X, FileText } from 'lucide-vue-next'
import ChatMessage from './ChatMessage.vue'
import { executeCode } from '../../utils/codeExecutor.js'
import { exportReport } from '../../agents/circuitReportAgent.js'
import { parseFile } from '../../utils/fileParser.js'

const store = useAssistantStore()

const input = ref('')
const loading = ref(false)
const messagesContainer = ref(null)
const fileInput = ref(null)
const selectedFile = ref(null)
const parsedContent = ref(null)
const parsing = ref(false)
const fileError = ref(null)

const messages = computed(() => store.currentSession?.messages || [])

async function send() {
  if ((!input.value.trim() && !parsedContent.value) || loading.value) return
  const text = input.value.trim() || '请分析我上传的文件'
  const fileContent = parsedContent.value || null
  const fileName = selectedFile.value?.name || null
  input.value = ''
  selectedFile.value = null
  parsedContent.value = null
  fileError.value = null
  loading.value = true
  try {
    await store.sendMessage(text, { fileContent, fileName })
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

function triggerFileUpload() {
  fileInput.value?.click()
}

async function onFileSelect(e) {
  const file = e.target.files[0]
  if (!file) return
  selectedFile.value = file
  parsing.value = true
  fileError.value = null
  try {
    const result = await parseFile(file)
    if (result.error) {
      fileError.value = result.error
      parsedContent.value = null
    } else {
      parsedContent.value = result.content
    }
  } catch (err) {
    fileError.value = `文件解析失败: ${err.message}`
    parsedContent.value = null
  } finally {
    parsing.value = false
    e.target.value = ''
  }
}

function clearFile() {
  selectedFile.value = null
  parsedContent.value = null
  fileError.value = null
}

async function onExecuteCode({ code, language }) {
  const options = {
    apiUrl: store.apiConfig.compileApiUrl,
    apiKey: store.apiConfig.compileApiKey,
  }
  const result = await executeCode(language, code, options)
  if (result.error) {
    alert(`执行失败: ${result.message}`)
  } else if (result.valid !== undefined) {
    alert(result.valid ? '语法检查通过' : `语法错误: ${result.errors.map(e => e.message).join(', ')}`)
  } else {
    const output = result.stdout || result.stderr || '执行完成（无输出）'
    alert(`执行结果:\n${output}`)
  }
}

async function onExportReport({ content, format }) {
  try {
    await exportReport(content, format)
  } catch (e) {
    alert(`导出失败: ${e.message}`)
  }
}

function startNewSession() {
  store.createSession()
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-12rem)]">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold flex items-center gap-2">
        <MessageSquare class="w-5 h-5 text-blue-500" />
        AI 对话
      </h3>
      <button
        @click="startNewSession"
        class="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
      >
        新对话
      </button>
    </div>

    <div ref="messagesContainer" class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-xl2 p-4 border border-gray-100 dark:border-gray-700">
      <div v-if="messages.length === 0" class="flex items-center justify-center h-full text-gray-400">
        <div class="text-center">
          <MessageSquare class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>开始与 AI 助手对话吧！</p>
          <p class="text-sm mt-1">输入你的问题，主 Agent 会自动路由到合适的子 Agent</p>
        </div>
      </div>
      <ChatMessage
        v-for="(msg, i) in messages"
        :key="i"
        :message="msg"
        @execute-code="onExecuteCode"
        @export-report="onExportReport"
      />
    </div>

    <div v-if="selectedFile" class="mt-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 flex items-center gap-2 text-sm">
      <FileText class="w-4 h-4 text-blue-500 flex-shrink-0" />
      <span class="flex-1 truncate text-gray-700 dark:text-gray-300">{{ selectedFile.name }}</span>
      <span v-if="parsing" class="text-blue-500 flex items-center gap-1">
        <Loader2 class="w-3 h-3 animate-spin" /> 解析中...
      </span>
      <span v-else-if="fileError" class="text-red-500">{{ fileError }}</span>
      <span v-else-if="parsedContent" class="text-green-500">已解析</span>
      <button @click="clearFile" class="text-gray-400 hover:text-red-500 flex-shrink-0">
        <X class="w-4 h-4" />
      </button>
    </div>

    <div class="mt-3 flex gap-2">
      <input ref="fileInput" type="file" class="hidden" @change="onFileSelect" accept="image/*,.pdf,.docx,.doc,.txt,.md" />
      <button
        @click="triggerFileUpload"
        :disabled="parsing || loading"
        class="px-3 rounded-xl2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors flex items-center justify-center"
        title="上传文件"
      >
        <Paperclip class="w-5 h-5 text-gray-500" />
      </button>
      <textarea
        v-model="input"
        @keydown="handleKeydown"
        placeholder="输入你的问题...（Enter 发送，Shift+Enter 换行）"
        rows="2"
        class="flex-1 px-4 py-2 rounded-xl2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 resize-none focus:outline-none focus:border-blue-400"
      />
      <button
        @click="send"
        :disabled="(!input.trim() && !parsedContent) || loading || parsing"
        class="px-4 rounded-xl2 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center"
      >
        <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
        <Send v-else class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>