<script setup>
import { ref, computed } from 'vue'
import CheckinManager from '../components/health/CheckinManager.vue'
import FitnessManager from '../components/health/FitnessManager.vue'
import ExerciseManager from '../components/health/ExerciseManager.vue'
import MoodManager from '../components/health/MoodManager.vue'
import BaseChart from '../components/charts/BaseChart.vue'
import { buildExerciseStatsOption, buildMoodTrendOption } from '../utils/chartOptions.js'
import { useHealthStore } from '../stores/health'

const health = useHealthStore()
const activeTab = ref('checkin')
const tabs = [
  { key: 'checkin', label: '打卡', icon: '📝' },
  { key: 'fitness', label: '体测', icon: '💪' },
  { key: 'exercise', label: '运动', icon: '🏃' },
  { key: 'mood', label: '心情', icon: '😊' },
]

const exerciseChartOption = computed(() => buildExerciseStatsOption(health.exercises))
const moodChartOption = computed(() => buildMoodTrendOption(health.moods))
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
    <div v-else-if="activeTab === 'exercise'">
      <ExerciseManager />
      <div class="mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">近7天运动统计</h3>
        <BaseChart :option="exerciseChartOption" height="250px" />
      </div>
    </div>
    <div v-else-if="activeTab === 'mood'">
      <MoodManager />
      <div class="mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">心情趋势</h3>
        <BaseChart :option="moodChartOption" height="250px" />
      </div>
    </div>
  </div>
</template>