<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  agent: { type: Object, default: null },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="agent" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-xl2 shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
      <div class="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
        <h3 class="font-semibold text-lg">{{ agent.name }}</h3>
        <button @click="emit('close')" class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <X class="w-5 h-5" />
        </button>
      </div>
      <div class="p-5 space-y-4">
        <div>
          <h4 class="text-sm font-semibold text-gray-500 mb-1">定位</h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">{{ agent.description }}</p>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-gray-500 mb-1">能力</h4>
          <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li v-for="(cap, i) in agent.capabilities" :key="i">• {{ cap }}</li>
          </ul>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-gray-500 mb-1">System Prompt 摘要</h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-6">{{ agent.systemPrompt }}</p>
        </div>
      </div>
    </div>
  </div>
</template>