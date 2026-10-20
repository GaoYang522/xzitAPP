<script setup>
import { ref } from 'vue'
import { Copy, Check, Play } from 'lucide-vue-next'

const props = defineProps({
  code: { type: String, default: '' },
  language: { type: String, default: '' },
  canExecute: { type: Boolean, default: false },
})

const emit = defineEmits(['execute'])

const copied = ref(false)

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    const ta = document.createElement('textarea')
    ta.value = props.code
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <div class="my-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
    <div class="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
      <span>{{ language || 'code' }}</span>
      <div class="flex items-center gap-2">
        <button
          v-if="canExecute"
          @click="emit('execute', code)"
          class="flex items-center gap-1 hover:text-green-500 transition-colors"
        >
          <Play class="w-3 h-3" />
          <span>执行</span>
        </button>
        <button
          @click="copyCode"
          class="flex items-center gap-1 hover:text-blue-500 transition-colors"
        >
          <Check v-if="copied" class="w-3 h-3 text-green-500" />
          <Copy v-else class="w-3 h-3" />
          <span>{{ copied ? '已复制' : '复制' }}</span>
        </button>
      </div>
    </div>
    <pre class="p-3 bg-gray-900 text-gray-100 text-sm overflow-x-auto"><code>{{ code }}</code></pre>
  </div>
</template>