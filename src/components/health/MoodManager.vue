<script setup>
import { ref, computed } from 'vue'
import { useHealthStore } from '../../stores/health'
import { formatDate } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'

const health = useHealthStore()
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ date: '', mood: 3, stress: 3, note: '' })

const sorted = computed(() =>
  [...health.moods].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
)

function openAdd() {
  editingId.value = null
  form.value = { date: formatDate(new Date()), mood: 3, stress: 3, note: '' }
  showForm.value = true
}
function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item }
  showForm.value = true
}
function save() {
  if (!form.value.date) return
  form.value.mood = Number(form.value.mood)
  form.value.stress = Number(form.value.stress)
  if (editingId.value) health.updateMood(editingId.value, form.value)
  else health.addMood(form.value)
  showForm.value = false
}

const moodEmojis = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">😊 心情记录</h2>
      <Btn @click="openAdd">+ 记录心情</Btn>
    </div>

    <EmptyState v-if="sorted.length === 0" icon="😊" text="还没有心情记录" />

    <div v-else class="space-y-2">
      <div v-for="item in sorted" :key="item.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all" @click="openEdit(item)">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">{{ moodEmojis[item.mood] || '😐' }}</span>
            <span class="text-sm text-gray-400">{{ item.date }}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-xs text-gray-400">压力</span>
            <div class="flex gap-0.5">
              <div v-for="n in 5" :key="n" :class="['w-2 h-4 rounded-sm', n <= item.stress ? 'bg-red-400' : 'bg-gray-200 dark:bg-gray-600']" />
            </div>
          </div>
        </div>
        <p v-if="item.note" class="mt-2 text-sm text-gray-500">{{ item.note }}</p>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑心情' : '记录心情'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">日期</label>
          <input type="date" v-model="form.date" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">心情</label>
          <div class="flex gap-2">
            <button v-for="n in 5" :key="n" @click="form.mood = n" :class="['w-12 h-12 rounded-xl text-2xl transition-all', form.mood === n ? 'bg-grad-blue scale-110' : 'bg-gray-100 dark:bg-gray-700']">{{ moodEmojis[n] }}</button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">压力值: {{ form.stress }}</label>
          <input type="range" min="1" max="5" v-model="form.stress" class="w-full accent-red-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">备注</label>
          <input v-model="form.note" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="health.removeMood(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>