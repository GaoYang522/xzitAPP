<script setup>
import { ref } from 'vue'
import TodoManager from '../components/tools/TodoManager.vue'
import NoteManager from '../components/tools/NoteManager.vue'
import CountdownManager from '../components/tools/CountdownManager.vue'
import HabitManager from '../components/tools/HabitManager.vue'
import PomodoroTimer from '../components/tools/PomodoroTimer.vue'

const activeTab = ref('todo')
const tabs = [
  { key: 'todo', label: '待办', icon: '✅' },
  { key: 'note', label: '备忘录', icon: '📒' },
  { key: 'countdown', label: '倒计时', icon: '⏰' },
  { key: 'habit', label: '习惯', icon: '🔥' },
  { key: 'pomodoro', label: '番茄钟', icon: '🍅' },
]
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">工具备忘</h1>
    <div class="flex gap-2 mb-6 flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-2 rounded-xl font-medium transition-all"
        :class="
          activeTab === tab.key
            ? 'bg-grad-blue text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        "
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>
    <TodoManager v-if="activeTab === 'todo'" />
    <NoteManager v-else-if="activeTab === 'note'" />
    <CountdownManager v-else-if="activeTab === 'countdown'" />
    <HabitManager v-else-if="activeTab === 'habit'" />
    <PomodoroTimer v-else-if="activeTab === 'pomodoro'" />
  </div>
</template>