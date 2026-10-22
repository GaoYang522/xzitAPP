<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import { usePomodoroStore } from '../../stores/pomodoro.js'
import { Play, Pause, RotateCcw, Coffee, Brain, Settings as SettingsIcon, Check } from 'lucide-vue-next'

const store = usePomodoroStore()

const phase = ref('idle')
const remainingSeconds = ref(0)
const subject = ref('')
const showSettings = ref(false)
let timer = null

const phaseLabel = computed(() => {
  if (phase.value === 'focusing') return '专注中'
  if (phase.value === 'breaking') return '休息中'
  if (phase.value === 'paused') return '已暂停'
  return '准备开始'
})

const phaseIcon = computed(() => {
  if (phase.value === 'breaking') return Coffee
  return Brain
})

const displayTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const progress = computed(() => {
  if (phase.value === 'idle') return 0
  const total = isLongBreak.value
    ? store.settings.longBreakDuration * 60
    : currentPhaseDuration.value * 60
  return ((total - remainingSeconds.value) / total) * 100
})

const isLongBreak = computed(() =>
  store.currentCycle > 0 && store.currentCycle % store.settings.cyclesBeforeLongBreak === 0
)

const currentPhaseDuration = computed(() =>
  phase.value === 'breaking'
    ? isLongBreak.value
      ? store.settings.longBreakDuration
      : store.settings.breakDuration
    : store.settings.focusDuration
)

function start() {
  if (phase.value === 'idle' || phase.value === 'paused') {
    if (phase.value === 'idle') {
      remainingSeconds.value = store.settings.focusDuration * 60
      phase.value = 'focusing'
    } else {
      phase.value = phase.value === 'paused-focusing' ? 'focusing' : 'breaking'
    }
    timer = setInterval(tick, 1000)
  }
}

function pause() {
  if (phase.value === 'focusing' || phase.value === 'breaking') {
    phase.value = phase.value === 'focusing' ? 'paused-focusing' : 'paused-breaking'
    clearInterval(timer)
    timer = null
  }
}

function reset() {
  clearInterval(timer)
  timer = null
  phase.value = 'idle'
  remainingSeconds.value = 0
}

function tick() {
  if (remainingSeconds.value > 0) {
    remainingSeconds.value -= 1
  } else {
    completePhase()
  }
}

function completePhase() {
  clearInterval(timer)
  timer = null

  if (phase.value === 'focusing') {
    store.recordSession({
      subject: subject.value || '未命名',
      duration: store.settings.focusDuration,
      type: 'focus',
    })
    const breakDuration = isLongBreak.value
      ? store.settings.longBreakDuration
      : store.settings.breakDuration
    remainingSeconds.value = breakDuration * 60
    phase.value = 'breaking'
    timer = setInterval(tick, 1000)
  } else if (phase.value === 'breaking') {
    store.recordSession({
      subject: '休息',
      duration: currentPhaseDuration.value,
      type: 'break',
    })
    phase.value = 'idle'
    remainingSeconds.value = 0
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <component :is="phaseIcon" class="w-5 h-5 text-orange-500" />
        番茄钟
      </h3>
      <button @click="showSettings = !showSettings" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
        <SettingsIcon class="w-4 h-4 text-gray-400" />
      </button>
    </div>

    <div v-if="showSettings" class="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <label class="text-sm text-gray-600 dark:text-gray-300">
          专注时长(分)
          <input v-model.number="store.settings.focusDuration" type="number" min="1" max="60" class="w-full mt-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
        </label>
        <label class="text-sm text-gray-600 dark:text-gray-300">
          休息时长(分)
          <input v-model.number="store.settings.breakDuration" type="number" min="1" max="30" class="w-full mt-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
        </label>
        <label class="text-sm text-gray-600 dark:text-gray-300">
          长休息(分)
          <input v-model.number="store.settings.longBreakDuration" type="number" min="1" max="60" class="w-full mt-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
        </label>
        <label class="text-sm text-gray-600 dark:text-gray-300">
          长休息周期
          <input v-model.number="store.settings.cyclesBeforeLongBreak" type="number" min="2" max="10" class="w-full mt-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
        </label>
      </div>
    </div>

    <div class="text-center py-6">
      <div class="text-5xl font-bold text-gray-800 dark:text-white mb-2 tabular-nums">{{ displayTime }}</div>
      <div class="text-sm text-gray-400">{{ phaseLabel }} · 第 {{ store.currentCycle + 1 }} 轮</div>
      <div class="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div class="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-400 transition-all" :style="{ width: progress + '%' }" />
      </div>
    </div>

    <input
      v-model="subject"
      :disabled="phase !== 'idle'"
      placeholder="正在专注什么？（如：高数作业）"
      class="w-full mb-3 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:border-orange-400 disabled:opacity-50"
    />

    <div class="flex gap-2 justify-center">
      <button
        v-if="phase === 'idle' || phase.startsWith('paused')"
        @click="start"
        class="px-6 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors flex items-center gap-2"
      >
        <Play class="w-5 h-5" /> 开始
      </button>
      <button
        v-if="phase === 'focusing' || phase === 'breaking'"
        @click="pause"
        class="px-6 py-2 rounded-xl bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 transition-colors flex items-center gap-2"
      >
        <Pause class="w-5 h-5" /> 暂停
      </button>
      <button
        v-if="phase !== 'idle'"
        @click="reset"
        class="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors flex items-center gap-2"
      >
        <RotateCcw class="w-5 h-5" /> 重置
      </button>
    </div>

    <div class="mt-6 grid grid-cols-3 gap-3 text-center">
      <div class="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
        <div class="text-2xl font-bold text-orange-500">{{ store.todaySessionCount }}</div>
        <div class="text-xs text-gray-400">今日专注</div>
      </div>
      <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
        <div class="text-2xl font-bold text-blue-500">{{ store.todayTotalMinutes }}</div>
        <div class="text-xs text-gray-400">今日分钟</div>
      </div>
      <div class="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
        <div class="text-2xl font-bold text-green-500">{{ store.weekTotalMinutes }}</div>
        <div class="text-xs text-gray-400">本周分钟</div>
      </div>
    </div>
  </div>
</template>