<script setup>
import { computed } from 'vue'
import { useStudyStore } from '../../stores/study'
import { useLifeStore } from '../../stores/life'
import { useClubStore } from '../../stores/club'
import { useHealthStore } from '../../stores/health'
import { useToolsStore } from '../../stores/tools'
import { daysBetween, today } from '../../composables/useDate'
import AppCard from '../common/AppCard.vue'
import Tag from '../common/Tag.vue'

const study = useStudyStore()
const life = useLifeStore()
const club = useClubStore()
const health = useHealthStore()
const tools = useToolsStore()

const pendingHomework = computed(() => study.homework.filter((h) => !h.done).length)
const upcomingExams = computed(() =>
  study.exams.filter((e) => e.date && daysBetween(today(), e.date) >= 0).slice(0, 3)
)
const pendingPackages = computed(() => life.packages.filter((p) => !p.taken).length)
const upcomingActivities = computed(() =>
  club.activities.filter((a) => a.date && daysBetween(today(), a.date) >= 0).slice(0, 3)
)
const checkedToday = computed(() => health.isCheckedToday())
const pendingTodos = computed(() => tools.todos.filter((t) => !t.done).length)
const upcomingCountdowns = computed(() =>
  tools.countdowns.filter((c) => c.date && daysBetween(today(), c.date) >= 0).slice(0, 3)
)
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <AppCard>
      <h3 class="font-semibold text-gray-800 dark:text-white mb-2">📚 学业</h3>
      <div class="space-y-1 text-sm">
        <p class="text-gray-500">未完成作业: <span class="font-bold text-orange-500">{{ pendingHomework }}</span></p>
        <div v-if="upcomingExams.length > 0">
          <p v-for="exam in upcomingExams" :key="exam.id" class="text-gray-500">
            {{ exam.subject }}: <span class="text-red-500">还有 {{ daysBetween(today(), exam.date) }} 天</span>
          </p>
        </div>
      </div>
    </AppCard>

    <AppCard>
      <h3 class="font-semibold text-gray-800 dark:text-white mb-2">💳 校园生活</h3>
      <div class="space-y-1 text-sm">
        <p class="text-gray-500">待取快递: <span class="font-bold text-orange-500">{{ pendingPackages }}</span></p>
        <p class="text-gray-500">一卡通余额: <span class="font-bold" :class="life.cardBalance >= 0 ? 'text-green-500' : 'text-red-500'">¥{{ life.cardBalance.toFixed(2) }}</span></p>
      </div>
    </AppCard>

    <AppCard>
      <h3 class="font-semibold text-gray-800 dark:text-white mb-2">👥 社团</h3>
      <div class="space-y-1 text-sm">
        <div v-if="upcomingActivities.length > 0">
          <p v-for="act in upcomingActivities" :key="act.id" class="text-gray-500">
            {{ act.name }}: <span class="text-blue-500">{{ act.date }}</span>
          </p>
        </div>
        <p v-else class="text-gray-400">暂无近期活动</p>
      </div>
    </AppCard>

    <AppCard>
      <h3 class="font-semibold text-gray-800 dark:text-white mb-2">📝 健康</h3>
      <p class="text-sm text-gray-500">
        今日打卡: <Tag :color="checkedToday ? 'green' : 'gray'">{{ checkedToday ? '已打卡' : '未打卡' }}</Tag>
      </p>
    </AppCard>

    <AppCard>
      <h3 class="font-semibold text-gray-800 dark:text-white mb-2">✅ 工具</h3>
      <div class="space-y-1 text-sm">
        <p class="text-gray-500">未完成待办: <span class="font-bold text-orange-500">{{ pendingTodos }}</span></p>
        <div v-if="upcomingCountdowns.length > 0">
          <p v-for="cd in upcomingCountdowns" :key="cd.id" class="text-gray-500">
            {{ cd.name }}: <span class="text-purple-500">{{ daysBetween(today(), cd.date) }} 天</span>
          </p>
        </div>
      </div>
    </AppCard>
  </div>
</template>