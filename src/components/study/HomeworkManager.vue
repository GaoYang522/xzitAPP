<script setup>
import { ref, computed } from 'vue'
import { useStudyStore } from '../../stores/study'
import { today, isSameDay, formatDate } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const study = useStudyStore()
const showForm = ref(false)
const editingId = ref(null)
const filterSubject = ref('')
const filterStatus = ref('all')
const form = ref({ subject: '', content: '', deadline: '', priority: 'medium', done: false })

const subjects = computed(() => [...new Set(study.homework.map((h) => h.subject))])

const priorityColors = { high: 'red', medium: 'orange', low: 'green' }
const priorityLabels = { high: '高', medium: '中', low: '低' }
const priorityOrder = { high: 3, medium: 2, low: 1 }

const filtered = computed(() => {
  return study.homework.filter((h) => {
    if (filterSubject.value && h.subject !== filterSubject.value) return false
    if (filterStatus.value === 'done' && !h.done) return false
    if (filterStatus.value === 'undone' && h.done) return false
    return true
  }).sort((a, b) => {
    if (a.done !== b.done) return a.done - b.done
    const pa = priorityOrder[a.priority] || 2
    const pb = priorityOrder[b.priority] || 2
    if (pa !== pb) return pb - pa
    return new Date(a.deadline || '9999') - new Date(b.deadline || '9999')
  })
})

function openAdd() {
  editingId.value = null
  form.value = { subject: '', content: '', deadline: '', priority: 'medium', done: false }
  showForm.value = true
}
function openEdit(hw) {
  editingId.value = hw.id
  form.value = { ...hw }
  showForm.value = true
}
function save() {
  if (!form.value.subject || !form.value.content) return
  if (editingId.value) study.updateHomework(editingId.value, form.value)
  else study.addHomework(form.value)
  showForm.value = false
}

</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">📝 作业登记</h2>
      <Btn @click="openAdd">+ 添加作业</Btn>
    </div>

    <div v-if="study.homework.length > 0" class="flex flex-wrap gap-2 mb-4">
      <select v-model="filterSubject" class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">
        <option value="">全部科目</option>
        <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
      </select>
      <select v-model="filterStatus" class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">
        <option value="all">全部状态</option>
        <option value="undone">未完成</option>
        <option value="done">已完成</option>
      </select>
    </div>

    <EmptyState v-if="filtered.length === 0" icon="📝" text="没有作业" />

    <div v-else class="space-y-2">
      <div v-for="hw in filtered" :key="hw.id" :class="['p-4 rounded-xl border cursor-pointer transition-all', hw.done ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-60' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:shadow-md']" @click="openEdit(hw)">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <input type="checkbox" :checked="hw.done" @click.stop="study.toggleHomeworkDone(hw.id)" class="w-5 h-5 rounded accent-blue-500" />
            <Tag :color="priorityColors[hw.priority]">{{ priorityLabels[hw.priority] }}</Tag>
            <span class="font-medium text-gray-800 dark:text-white" :class="{ 'line-through': hw.done }">{{ hw.subject }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span v-if="hw.deadline" :class="isSameDay(hw.deadline, today()) ? 'text-red-500 font-medium' : 'text-gray-400'">
              {{ hw.deadline }}
            </span>
          </div>
        </div>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300" :class="{ 'line-through': hw.done }">{{ hw.content }}</p>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑作业' : '添加作业'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">科目</label>
          <input v-model="form.subject" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：高等数学" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">内容</label>
          <textarea v-model="form.content" rows="3" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="作业内容"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">截止时间</label>
            <input type="date" v-model="form.deadline" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">优先级</label>
            <select v-model="form.priority" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="study.removeHomework(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>