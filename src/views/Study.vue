<script setup>
import { ref, computed } from 'vue'
import CourseManager from '../components/study/CourseManager.vue'
import HomeworkManager from '../components/study/HomeworkManager.vue'
import ExamManager from '../components/study/ExamManager.vue'
import GradeManager from '../components/study/GradeManager.vue'
import BaseChart from '../components/charts/BaseChart.vue'
import { buildGradeTrendOption } from '../utils/chartOptions.js'
import { useStudyStore } from '../stores/study'

const study = useStudyStore()
const activeTab = ref('course')
const tabs = [
  { key: 'course', label: '课表', icon: '📚' },
  { key: 'homework', label: '作业', icon: '📝' },
  { key: 'exam', label: '考试', icon: '📋' },
  { key: 'grade', label: '成绩', icon: '🏆' },
]

const gradeChartOption = computed(() => buildGradeTrendOption(study.grades))
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">学业学习</h1>
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
    <CourseManager v-if="activeTab === 'course'" />
    <HomeworkManager v-else-if="activeTab === 'homework'" />
    <ExamManager v-else-if="activeTab === 'exam'" />
    <div v-else-if="activeTab === 'grade'">
      <GradeManager />
      <div class="mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">成绩趋势</h3>
        <BaseChart :option="gradeChartOption" height="250px" />
      </div>
    </div>
  </div>
</template>