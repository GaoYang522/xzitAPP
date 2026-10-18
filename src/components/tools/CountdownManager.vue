<script setup>
import { ref, computed } from 'vue'
import { useToolsStore } from '../../stores/tools'
import { daysBetween, today } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const tools = useToolsStore()
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '', date: '', category: 'other' })

const categoryColors = { exam: 'red', holiday: 'green', birthday: 'pink', anniversary: 'purple', other: 'blue' }
const categoryLabels = { exam: '考试', holiday: '放假', birthday: '生日', anniversary: '纪念日', other: '其他' }

const sorted = computed(() =>
  [...tools.countdowns].sort((a, b) => new Date(a.date || '9999') - new Date(b.date || '9999'))
)

function getDays(date) {
  if (!date) return null
  return daysBetween(today(), date)
}

function openAdd() {
  editingId.value = null
  form.value = { name: '', date: '', category: 'other' }
  showForm.value = true
}
function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item }
  showForm.value = true
}
function save() {
  if (!form.value.name) return
  if (editingId.value) tools.updateCountdown(editingId.value, form.value)
  else tools.addCountdown(form.value)
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">⏰ 倒计时</h2>
      <Btn @click="openAdd">+ 添加倒计时</Btn>
    </div>

    <EmptyState v-if="sorted.length === 0" icon="⏰" text="没有倒计时" />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="item in sorted" :key="item.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all" @click="openEdit(item)">
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-gray-800 dark:text-white">{{ item.name }}</span>
          <Tag :color="categoryColors[item.category]">{{ categoryLabels[item.category] }}</Tag>
        </div>
        <div class="flex items-end justify-between">
          <span class="text-sm text-gray-400">{{ item.date }}</span>
          <div v-if="getDays(item.date) !== null" class="text-right">
            <span class="text-2xl font-bold" :class="getDays(item.date) < 0 ? 'text-gray-400' : 'bg-grad-orange bg-clip-text text-transparent'">
              {{ Math.abs(getDays(item.date)) }}
            </span>
            <span class="text-sm text-gray-400 ml-1">{{ getDays(item.date) < 0 ? '天前' : '天' }}</span>
          </div>
        </div>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑倒计时' : '添加倒计时'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">事件名称</label>
          <input v-model="form.name" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：期末考试" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">目标日期</label>
            <input type="date" v-model="form.date" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">分类</label>
            <select v-model="form.category" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option v-for="(label, key) in categoryLabels" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="tools.removeCountdown(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>