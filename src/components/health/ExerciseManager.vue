<script setup>
import { ref, computed } from 'vue'
import { useHealthStore } from '../../stores/health'
import { formatDate } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import AppCard from '../common/AppCard.vue'

const health = useHealthStore()
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ date: '', type: '', duration: 0, distance: '', unit: 'km', note: '' })

const unitOptions = [
  { value: 'km', label: '公里(km)' },
  { value: 'm', label: '米(m)' },
  { value: '次', label: '次' },
  { value: '个', label: '个' },
  { value: '组', label: '组' },
]

const distanceLabel = computed(() => {
  const u = unitOptions.find((o) => o.value === form.value.unit)
  return u ? u.label : '距离/数量'
})

const sorted = computed(() =>
  [...health.exercises].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
)

function getStats(days) {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - days)
  const items = health.exercises.filter((e) => new Date(e.date) >= start)
  const totalDuration = items.reduce((sum, e) => sum + Number(e.duration || 0), 0)
  const byUnit = {}
  for (const e of items) {
    if (!e.distance) continue
    const u = e.unit || 'km'
    byUnit[u] = (byUnit[u] || 0) + Number(e.distance || 0)
  }
  const distanceTexts = Object.entries(byUnit).map(([u, v]) => `${v.toFixed(1)} ${u}`)
  return { totalDuration, distanceText: distanceTexts.join(' / ') || '0 km' }
}

const weekStats = computed(() => getStats(7))
const monthStats = computed(() => getStats(30))

function openAdd() {
  editingId.value = null
  form.value = { date: formatDate(new Date()), type: '', duration: 0, distance: '', unit: 'km', note: '' }
  showForm.value = true
}
function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item }
  showForm.value = true
}
function save() {
  if (!form.value.type) return
  form.value.duration = Number(form.value.duration)
  if (editingId.value) health.updateExercise(editingId.value, form.value)
  else health.addExercise(form.value)
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">🏃 运动记录</h2>
      <Btn @click="openAdd">+ 记录运动</Btn>
    </div>

    <div v-if="health.exercises.length > 0" class="grid grid-cols-2 gap-4 mb-4">
      <AppCard>
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-1">本周</p>
          <p class="text-2xl font-bold text-green-500">{{ weekStats.totalDuration }} 分钟</p>
          <p class="text-sm text-gray-400">{{ weekStats.distanceText }}</p>
        </div>
      </AppCard>
      <AppCard>
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-1">本月</p>
          <p class="text-2xl font-bold text-blue-500">{{ monthStats.totalDuration }} 分钟</p>
          <p class="text-sm text-gray-400">{{ monthStats.distanceText }}</p>
        </div>
      </AppCard>
    </div>

    <EmptyState v-if="sorted.length === 0" icon="🏃" text="还没有运动记录" />

    <div v-else class="space-y-2">
      <div v-for="item in sorted" :key="item.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all flex items-center justify-between" @click="openEdit(item)">
        <div>
          <span class="font-semibold text-gray-800 dark:text-white">{{ item.type }}</span>
          <span class="text-sm text-gray-400 ml-2">{{ item.date }}</span>
        </div>
        <div class="flex items-center gap-3 text-sm">
          <span class="text-green-500">{{ item.duration }} 分钟</span>
          <span v-if="item.distance" class="text-blue-500">{{ item.distance }} {{ item.unit || 'km' }}</span>
        </div>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑运动' : '记录运动'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">日期</label>
          <input type="date" v-model="form.date" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">运动类型</label>
            <input v-model="form.type" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：跑步" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">时长(分钟)</label>
            <input type="number" min="0" v-model="form.duration" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">距离/数量</label>
            <div class="flex gap-2">
              <input type="number" step="0.1" v-model="form.distance" class="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
              <select v-model="form.unit" class="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                <option v-for="opt in unitOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">备注</label>
          <input v-model="form.note" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="health.removeExercise(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>