<script setup>
import { ref, computed } from 'vue'
import { useHealthStore } from '../../stores/health'
import { formatDate } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const health = useHealthStore()
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ date: '', sleepTime: '', wakeTime: '', exercise: '', mood: 3, note: '' })

const sortedCheckins = computed(() =>
  [...health.checkins].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
)

const todayCheckin = computed(() => health.isCheckedToday())

function openAdd() {
  editingId.value = null
  form.value = { date: formatDate(new Date()), sleepTime: '', wakeTime: '', exercise: '', mood: 3, note: '' }
  showForm.value = true
}
function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item }
  showForm.value = true
}
function save() {
  if (!form.value.date) return
  if (editingId.value) health.updateCheckin(editingId.value, form.value)
  else health.addCheckin(form.value)
  showForm.value = false
}

const moodEmojis = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">📝 每日打卡</h2>
      <Btn @click="openAdd">{{ todayCheckin ? '编辑今日打卡' : '+ 今日打卡' }}</Btn>
    </div>

    <div class="mb-4 p-4 rounded-xl" :class="todayCheckin ? 'bg-grad-green text-white' : 'bg-gray-100 dark:bg-gray-700'">
      <span v-if="todayCheckin">✅ 今日已打卡</span>
      <span v-else class="text-gray-500">⭕ 今日还未打卡</span>
    </div>

    <EmptyState v-if="sortedCheckins.length === 0" icon="📝" text="还没有打卡记录" />

    <div v-else class="space-y-2">
      <div v-for="item in sortedCheckins" :key="item.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all" @click="openEdit(item)">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-gray-800 dark:text-white">{{ item.date }}</span>
          <span class="text-2xl">{{ moodEmojis[item.mood] || '😐' }}</span>
        </div>
        <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
          <span v-if="item.sleepTime">就寝 {{ item.sleepTime }}</span>
          <span v-if="item.wakeTime">起床 {{ item.wakeTime }}</span>
          <span v-if="item.exercise">运动 {{ item.exercise }}</span>
        </div>
        <p v-if="item.note" class="mt-1 text-sm text-gray-400">{{ item.note }}</p>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑打卡' : '每日打卡'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">日期</label>
          <input type="date" v-model="form.date" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">就寝时间</label>
            <input type="time" v-model="form.sleepTime" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">起床时间</label>
            <input type="time" v-model="form.wakeTime" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">运动情况</label>
          <input v-model="form.exercise" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：跑步30分钟" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">心情</label>
          <div class="flex gap-2">
            <button v-for="n in 5" :key="n" @click="form.mood = n" :class="['w-10 h-10 rounded-xl text-xl transition-all', form.mood === n ? 'bg-grad-blue scale-110' : 'bg-gray-100 dark:bg-gray-700']">{{ moodEmojis[n] }}</button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">备注</label>
          <input v-model="form.note" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="health.removeCheckin(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>