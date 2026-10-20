<script setup>
import { computed } from 'vue'
import { User, Bot, FileText, FileType } from 'lucide-vue-next'
import { marked } from 'marked'
import CodeBlock from './CodeBlock.vue'
import RouteIndicator from './RouteIndicator.vue'

const props = defineProps({
  message: { type: Object, required: true },
})

const emit = defineEmits(['execute-code', 'export-report'])

const renderedHtml = computed(() => {
  if (props.message.role === 'assistant') {
    return marked.parse(props.message.content || '', { breaks: true })
  }
  return ''
})

const codeBlocks = computed(() => {
  if (props.message.role !== 'assistant') return []
  const blocks = []
  const regex = /```(\w*)\n([\s\S]*?)```/g
  let match
  while ((match = regex.exec(props.message.content || '')) !== null) {
    blocks.push({ language: match[1], code: match[2] })
  }
  return blocks
})

const canExecuteCode = (lang) => {
  const executable = ['matlab', 'octave', 'c', 'cpp', 'c++']
  return executable.includes(lang.toLowerCase())
}

const isCircuitReport = computed(() => {
  return props.message.agentId === 'circuit-report' && props.message.role === 'assistant'
})
</script>

<template>
  <div :class="message.role === 'user' ? 'flex justify-end' : 'flex justify-start'" class="mb-4">
    <div :class="message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'" class="rounded-xl2 px-4 py-3 max-w-[80%]">
      <div class="flex items-center gap-2 mb-1 text-xs opacity-70">
        <User v-if="message.role === 'user'" class="w-3 h-3" />
        <Bot v-else class="w-3 h-3" />
        <span>{{ message.role === 'user' ? '我' : (message.agentName || 'AI') }}</span>
      </div>

      <RouteIndicator
        v-if="message.routeInfo && message.role === 'assistant'"
        :agent-name="message.agentName || ''"
        :method="message.routeInfo.method || ''"
        :steps="message.steps"
      />

      <div v-if="message.role === 'user'" class="whitespace-pre-wrap">{{ message.content }}</div>
      <div v-else>
        <div class="prose prose-sm dark:prose-invert max-w-none" v-html="renderedHtml"></div>

        <div v-for="(block, i) in codeBlocks" :key="i">
          <CodeBlock
            :code="block.code"
            :language="block.language"
            :can-execute="canExecuteCode(block.language)"
            @execute="(code) => emit('execute-code', { code, language: block.language })"
          />
        </div>

        <div v-if="isCircuitReport" class="flex gap-2 mt-3">
          <button
            @click="emit('export-report', { content: message.content, format: 'docx' })"
            class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
          >
            <FileText class="w-4 h-4" />
            导出 Word
          </button>
          <button
            @click="emit('export-report', { content: message.content, format: 'pdf' })"
            class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
          >
            <FileType class="w-4 h-4" />
            导出 PDF
          </button>
        </div>

        <div v-if="message.error" class="mt-2 text-sm text-red-500">
          错误：{{ message.message || message.error }}
        </div>

        <div v-if="message.candidates" class="mt-2">
          <p class="text-sm text-gray-500 mb-1">请选择一个助手：</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in message.candidates"
              :key="c.id"
              class="px-3 py-1 rounded-lg bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-sm hover:border-blue-400 transition-colors"
            >
              {{ c.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>