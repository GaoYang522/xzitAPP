<script setup>
import { ref, computed } from 'vue'
import { useStudyStore } from '../../stores/study'
import { daysBetween, today } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const study = useStudyStore()
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ subject: '', date: '', location: '', note: '' })

const sortedExams = computed(() =>
  [...study.exams].sort((a, b) => new Date(a.date || '9999') - new Date(b.date || '9999'))
)

function getCountdown(date) {
  if (!date) return null
  return daysBetween(today(), date)
}

function openAdd() {
  editingId.value = null
  form.value = { subject: '', date: '', location: '', note: '' }
  showForm.value = true
}
function openEdit(exam) {
  editingId.value = exam.id
  form.value = { ...exam }
  showForm.value = true
}
function save() {
  if (!form.value.subject) return
  if (editingId.value) study.updateExam(editingId.value, form.value)
  else study.addExam(form.value)
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">📋 考试安排</h2>
      <Btn @click="openAdd">+ 添加考试</Btn>
    </div>

    <EmptyState v-if="sortedExams.length === 0" icon="📋" text="没有考试安排" />

    <div v-else class="space-y-2">
      <div v-for="exam in sortedExams" :key="exam.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all" @click="openEdit(exam)">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-800 dark:text-white">{{ exam.subject }}</span>
            <span v-if="exam.location" class="text-sm text-gray-400">@{{ exam.location }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="exam.date" class="text-sm text-gray-500">{{ exam.date }}</span>
            <Tag v-if="getCountdown(exam.date) !== null" :color="getCountdown(exam.date) < 0 ? 'gray' : getCountdown(exam.date) <= 7 ? 'red' : 'blue'">
              {{ getCountdown(exam.date) < 0 ? '已结束' : `还有 ${getCountdown(exam.date)} 天` }}
            </Tag>
          </div>
        </div>
        <p v-if="exam.note" class="mt-2 text-sm text-gray-500">{{ exam.note }}</p>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑考试' : '添加考试'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">科目</label>
          <input v-model="form.subject" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：高等数学" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">考试时间</label>
            <input type="date" v-model="form.date" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">地点</label>
            <input v-model="form.location" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：教1-101" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">备注</label>
          <textarea v-model="form.note" rows="2" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="可选"></textarea>
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="study.removeExam(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>