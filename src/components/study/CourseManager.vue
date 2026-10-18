<script setup>
import { ref, computed, watch } from 'vue'
import { useStudyStore } from '../../stores/study'
import { useSettingsStore } from '../../stores/settings'
import { getCurrentWeek, isCourseInWeek } from '../../composables/useWeek'
import { parsePdfSchedule } from '../../utils/pdfScheduleParser'
import { getSectionTime } from '../../utils/sectionTime'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'

const study = useStudyStore()
const settings = useSettingsStore()

const currentWeek = computed(() => getCurrentWeek(settings.semesterStart, settings.totalWeeks))
const viewWeek = ref(currentWeek.value || 1)
watch(currentWeek, (nw) => { if (nw) viewWeek.value = nw })
function prevWeek() { if (viewWeek.value > 1) viewWeek.value-- }
function nextWeek() { if (viewWeek.value < settings.totalWeeks) viewWeek.value++ }
const showForm = ref(false)
const editingId = ref(null)
const form = ref({
  name: '', day: 1, startSection: 1, endSection: 2,
  location: '', teacher: '', startWeek: 1, endWeek: 16, color: 'blue',
})

const showImportModal = ref(false)
const importLoading = ref(false)
const importMessage = ref('')
const importError = ref('')
const fileInputRef = ref(null)

async function handlePdfImport() {
  fileInputRef.value?.click()
}

async function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return
  importLoading.value = true
  importError.value = ''
  importMessage.value = ''
  try {
    const result = await parsePdfSchedule(file)
    const courses = result.courses || result
    const sectionTimes = result.sectionTimes
    if (!courses || courses.length === 0) {
      importError.value = '解析失败，请检查PDF格式'
      showImportModal.value = true
    } else {
      study.courses.splice(0, study.courses.length)
      for (const c of courses) {
        study.addCourse(c)
      }
      if (sectionTimes) study.sectionTimes = sectionTimes
      importMessage.value = `成功导入 ${courses.length} 门课程`
      showImportModal.value = true
    }
  } catch (e) {
    importError.value = '解析失败，请检查PDF格式'
    showImportModal.value = true
  } finally {
    importLoading.value = false
    event.target.value = ''
  }
}

const colorMap = {
  blue: 'bg-blue-500 text-white', purple: 'bg-purple-500 text-white',
  orange: 'bg-orange-500 text-white', green: 'bg-green-500 text-white',
  pink: 'bg-pink-500 text-white', cyan: 'bg-cyan-500 text-white',
}
const colorKeys = Object.keys(colorMap)
const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function openAdd() {
  editingId.value = null
  form.value = { name: '', day: 1, startSection: 1, endSection: 2, location: '', teacher: '', startWeek: 1, endWeek: 16, color: 'blue' }
  showForm.value = true
}
function openEdit(course) {
  editingId.value = course.id
  form.value = { ...course }
  showForm.value = true
}
function save() {
  if (!form.value.name) return
  if (editingId.value) study.updateCourse(editingId.value, form.value)
  else study.addCourse(form.value)
  showForm.value = false
}
function getCourseAt(day, section) {
  return study.courses.find(
    (c) => c.day === day && section >= c.startSection && section <= c.endSection && isCourseInWeek(c, viewWeek.value)
  )
}
function sectionTimeText(section) {
  const t = study.sectionTimes[section]
  if (t && t.start && t.end) return `${t.start}-${t.end}`
  return getSectionTime(section)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <h2 class="text-lg font-bold text-gray-800 dark:text-white">📚 课表管理</h2>
        <div v-if="currentWeek" class="flex items-center gap-1">
          <button
            @click="prevWeek"
            :disabled="viewWeek <= 1"
            class="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="上一周"
          >‹</button>
          <span class="px-3 py-1 rounded-full bg-grad-blue text-white text-sm font-medium whitespace-nowrap">
            第 {{ viewWeek }} 周<span v-if="viewWeek === currentWeek" class="opacity-80 ml-1">·本周</span>
          </span>
          <button
            @click="nextWeek"
            :disabled="viewWeek >= settings.totalWeeks"
            class="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="下一周"
          >›</button>
        </div>
        <span v-else class="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 text-sm">
          未设置学期
        </span>
      </div>
      <div class="flex gap-2">
        <button
          @click="handlePdfImport"
          :disabled="importLoading"
          class="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ importLoading ? '解析中...' : '📥 导入PDF课表' }}
        </button>
        <Btn @click="openAdd">+ 添加课程</Btn>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept=".pdf"
      class="hidden"
      @change="onFileSelected"
    />

    <div v-if="study.courses.length === 0">
      <EmptyState icon="📚" text="还没有课程，点击右上角添加" />
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse min-w-[700px]">
        <thead>
          <tr>
            <th class="p-2 text-xs text-gray-400 w-20">时间</th>
            <th class="p-2 text-xs text-gray-400 w-12">节次</th>
            <th v-for="(day, i) in weekdays" :key="i" class="p-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              {{ day }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="section in 14" :key="section">
            <td class="p-1 text-center text-xs text-gray-400 whitespace-nowrap">{{ sectionTimeText(section) }}</td>
            <td class="p-2 text-center text-xs text-gray-400">{{ section }}</td>
            <td v-for="day in 7" :key="day" class="p-1 border border-gray-100 dark:border-gray-700 align-top">
              <div v-if="getCourseAt(day, section)" :class="['rounded-lg p-2 text-xs cursor-pointer break-all', colorMap[getCourseAt(day, section).color]]" @click="openEdit(getCourseAt(day, section))">
                <div class="font-semibold leading-tight">{{ getCourseAt(day, section).name }}</div>
                <div class="opacity-80">@{{ getCourseAt(day, section).location || '未排地点' }}</div>
                <div v-if="getCourseAt(day, section).teacher" class="opacity-80 mt-0.5">👤 {{ getCourseAt(day, section).teacher }}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑课程' : '添加课程'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">课程名称</label>
          <input v-model="form.name" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：高等数学" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">星期</label>
            <select v-model="form.day" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option v-for="(d, i) in weekdays" :key="i" :value="i + 1">{{ d }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">地点</label>
            <input v-model="form.location" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：教1-101" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">起始节次</label>
            <input type="number" min="1" max="14" v-model="form.startSection" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">结束节次</label>
            <input type="number" min="1" max="14" v-model="form.endSection" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">起始周</label>
            <input type="number" min="1" max="30" v-model="form.startWeek" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">结束周</label>
            <input type="number" min="1" max="30" v-model="form.endWeek" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">老师</label>
          <input v-model="form.teacher" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="可选" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">颜色标记</label>
          <div class="flex gap-2">
            <button v-for="c in colorKeys" :key="c" @click="form.color = c" :class="['w-8 h-8 rounded-full', colorMap[c], form.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : '']" />
          </div>
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="study.removeCourse(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>

    <Modal :show="showImportModal" :title="importError ? '导入失败' : '导入成功'" @close="showImportModal = false">
      <p v-if="importError" class="text-red-500">{{ importError }}</p>
      <p v-else class="text-green-600">{{ importMessage }}</p>
      <template #footer>
        <Btn @click="showImportModal = false">确定</Btn>
      </template>
    </Modal>
  </div>
</template>