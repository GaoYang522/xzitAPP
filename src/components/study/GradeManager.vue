<script setup>
import { ref, computed } from 'vue'
import { useStudyStore } from '../../stores/study'
import { calculateGPA, calculateWeightedAvg } from '../../utils/gpa'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import AppCard from '../common/AppCard.vue'

const study = useStudyStore()
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ subject: '', score: 0, credit: 0, semester: '' })

const gpa = computed(() => calculateGPA(study.grades))
const weightedAvg = computed(() => calculateWeightedAvg(study.grades))

function openAdd() {
  editingId.value = null
  form.value = { subject: '', score: 0, credit: 0, semester: '' }
  showForm.value = true
}
function openEdit(grade) {
  editingId.value = grade.id
  form.value = { ...grade }
  showForm.value = true
}
function save() {
  if (!form.value.subject) return
  form.value.score = Number(form.value.score)
  form.value.credit = Number(form.value.credit)
  if (editingId.value) study.updateGrade(editingId.value, form.value)
  else study.addGrade(form.value)
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">🏆 成绩记录</h2>
      <Btn @click="openAdd">+ 录入成绩</Btn>
    </div>

    <div v-if="study.grades.length > 0" class="grid grid-cols-2 gap-4 mb-4">
      <AppCard>
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-1">GPA</p>
          <p class="text-3xl font-bold bg-grad-blue bg-clip-text text-transparent">{{ gpa.toFixed(2) }}</p>
        </div>
      </AppCard>
      <AppCard>
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-1">加权平均分</p>
          <p class="text-3xl font-bold bg-grad-purple bg-clip-text text-transparent">{{ weightedAvg.toFixed(1) }}</p>
        </div>
      </AppCard>
    </div>

    <EmptyState v-if="study.grades.length === 0" icon="🏆" text="还没有成绩记录" />

    <div v-else class="space-y-2">
      <div v-for="grade in study.grades" :key="grade.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all flex items-center justify-between" @click="openEdit(grade)">
        <div>
          <span class="font-semibold text-gray-800 dark:text-white">{{ grade.subject }}</span>
          <span v-if="grade.semester" class="text-sm text-gray-400 ml-2">{{ grade.semester }}</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-400">{{ grade.credit }} 学分</span>
          <span class="text-lg font-bold" :class="grade.score >= 60 ? 'text-green-500' : 'text-red-500'">{{ grade.score }}</span>
        </div>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑成绩' : '录入成绩'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">科目</label>
          <input v-model="form.subject" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：高等数学" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">成绩</label>
            <input type="number" min="0" max="100" v-model="form.score" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">学分</label>
            <input type="number" min="0" step="0.5" v-model="form.credit" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">学期</label>
          <input v-model="form.semester" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：2026秋季" />
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="study.removeGrade(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>