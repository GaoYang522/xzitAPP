<script setup>
import { computed } from 'vue'
import { useStudyStore } from '../../stores/study'
import { useSettingsStore } from '../../stores/settings'
import { getCurrentWeek, isCourseInWeek } from '../../composables/useWeek'
import { getWeekday } from '../../composables/useDate'
import AppCard from '../common/AppCard.vue'
import EmptyState from '../common/EmptyState.vue'

const study = useStudyStore()
const settings = useSettingsStore()

const currentWeek = computed(() => getCurrentWeek(settings.semesterStart, settings.totalWeeks))

const todayCourses = computed(() => {
  const weekday = getWeekday()
  return study.courses
    .filter((c) => c.day === weekday && isCourseInWeek(c, currentWeek.value))
    .sort((a, b) => a.startSection - b.startSection)
})

const colorMap = {
  blue: 'border-blue-500', purple: 'border-purple-500', orange: 'border-orange-500',
  green: 'border-green-500', pink: 'border-pink-500', cyan: 'border-cyan-500',
}
</script>

<template>
  <AppCard title="今日课表" gradient="bg-grad-blue">
    <div v-if="!currentWeek" class="text-sm text-gray-400 text-center py-4">
      请先在设置中配置学期开始日期
    </div>
    <EmptyState v-else-if="todayCourses.length === 0" icon="🎉" text="今天没课，自由时间！" />
    <div v-else class="space-y-2">
      <div v-for="course in todayCourses" :key="course.id" :class="['p-3 rounded-xl border-l-4 bg-gray-50 dark:bg-gray-700/50', colorMap[course.color] || 'border-blue-500']">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-gray-800 dark:text-white">{{ course.name }}</span>
          <span class="text-sm text-gray-400">第{{ course.startSection }}-{{ course.endSection }}节</span>
        </div>
        <p class="text-sm text-gray-500 mt-1">📍 {{ course.location || '未设置' }}</p>
      </div>
    </div>
  </AppCard>
</template>