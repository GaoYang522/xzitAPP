<script setup>
import { ref } from 'vue'
import CheckinManager from '../components/health/CheckinManager.vue'
import FitnessManager from '../components/health/FitnessManager.vue'
import ExerciseManager from '../components/health/ExerciseManager.vue'
import MoodManager from '../components/health/MoodManager.vue'

const activeTab = ref('checkin')
const tabs = [
  { key: 'checkin', label: '打卡', icon: '📝' },
  { key: 'fitness', label: '体测', icon: '💪' },
  { key: 'exercise', label: '运动', icon: '🏃' },
  { key: 'mood', label: '心情', icon: '😊' },
]
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">健康管理</h1>
    <div class="flex gap-2 mb-6">
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
    <CheckinManager v-if="activeTab === 'checkin'" />
    <FitnessManager v-else-if="activeTab === 'fitness'" />
    <ExerciseManager v-else-if="activeTab === 'exercise'" />
    <MoodManager v-else-if="activeTab === 'mood'" />
  </div>
</template>