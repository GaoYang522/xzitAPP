<script setup>
import { ref } from 'vue'
import { useToolsStore } from '../../stores/tools'
import { formatDate } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'

const tools = useToolsStore()
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '', frequency: 'daily' })

function isCheckedToday(habit) {
  const todayStr = formatDate(new Date())
  return habit.checkins && habit.checkins.includes(todayStr)
}

function checkToday(habit) {
  const todayStr = formatDate(new Date())
  tools.toggleHabitCheck(habit.id, todayStr)
}

function openAdd() {
  editingId.value = null
  form.value = { name: '', frequency: 'daily' }
  showForm.value = true
}
function openEdit(habit) {
  editingId.value = habit.id
  form.value = { name: habit.name, frequency: habit.frequency || 'daily' }
  showForm.value = true
}
function save() {
  if (!form.value.name) return
  if (editingId.value) tools.updateHabit(editingId.value, form.value)
  else tools.addHabit({ ...form.value, checkins: [] })
  showForm.value = false
}

const frequencyLabels = { daily: '每日', weekly: '每周', custom: '自定义' }
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">🔥 习惯打卡</h2>
      <Btn @click="openAdd">+ 添加习惯</Btn>
    </div>

    <EmptyState v-if="tools.habits.length === 0" icon="🔥" text="还没有习惯，开始养成一个好习惯吧" />

    <div v-else class="space-y-3">
      <div v-for="habit in tools.habits" :key="habit.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="checkToday(habit)" :class="['w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all', isCheckedToday(habit) ? 'bg-grad-green text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200']">
              {{ isCheckedToday(habit) ? '✓' : '○' }}
            </button>
            <div>
              <span class="font-semibold text-gray-800 dark:text-white block">{{ habit.name }}</span>
              <span class="text-xs text-gray-400">{{ frequencyLabels[habit.frequency] || '每日' }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <span class="text-2xl font-bold bg-grad-orange bg-clip-text text-transparent">{{ tools.getHabitStreak(habit.id) }}</span>
              <span class="text-sm text-gray-400">天连续</span>
            </div>
            <button @click="openEdit(habit)" class="text-gray-400 hover:text-gray-600 text-sm">编辑</button>
          </div>
        </div>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑习惯' : '添加习惯'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">习惯名称</label>
          <input v-model="form.name" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：早起" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">目标频率</label>
          <select v-model="form.frequency" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
            <option value="daily">每日</option>
            <option value="weekly">每周</option>
            <option value="custom">自定义</option>
          </select>
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="tools.removeHabit(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>