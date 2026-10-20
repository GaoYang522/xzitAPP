<script setup>
import { Calculator, FileText, Cpu, ChevronRight } from 'lucide-vue-next'
import { SUB_AGENTS } from '../../agents/agentConfig.js'

const emit = defineEmits(['select'])

const iconMap = {
  calculator: Calculator,
  'file-text': FileText,
  cpu: Cpu,
}

const colorMap = {
  orange: 'from-orange-400 to-orange-500',
  blue: 'from-blue-400 to-blue-500',
  purple: 'from-purple-400 to-purple-500',
}
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <div
      v-for="agent in SUB_AGENTS"
      :key="agent.id"
      @click="emit('select', agent)"
      class="cursor-pointer rounded-xl2 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div :class="`bg-gradient-to-r ${colorMap[agent.color]} px-5 py-4 text-white`">
        <div class="flex items-center gap-3">
          <component :is="iconMap[agent.icon]" class="w-6 h-6" />
          <div>
            <h3 class="font-semibold">{{ agent.shortName }}</h3>
          </div>
        </div>
      </div>
      <div class="p-5">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ agent.description }}</p>
        <ul class="text-xs text-gray-500 dark:text-gray-500 space-y-1">
          <li v-for="(cap, i) in agent.capabilities" :key="i" class="flex items-start gap-1">
            <ChevronRight class="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{{ cap }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>