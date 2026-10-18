<script setup>
import { ref, computed } from 'vue'
import { useToolsStore } from '../../stores/tools'
import { today, isSameDay } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const tools = useToolsStore()
const showForm = ref(false)
const editingId = ref(null)
const filterCategory = ref('')
const filterPriority = ref('')
const filterStatus = ref('all')
const form = ref({ title: '', category: '', priority: 'medium', deadline: '', done: false, note: '' })

const categories = computed(() => [...new Set(tools.todos.map((t) => t.category).filter(Boolean))])

const filtered = computed(() => {
  return tools.todos
    .filter((t) => {
      if (filterCategory.value && t.category !== filterCategory.value) return false
      if (filterPriority.value && t.priority !== filterPriority.value) return false
      if (filterStatus.value === 'done' && !t.done) return false
      if (filterStatus.value === 'undone' && t.done) return false
      return true
    })
    .sort((a, b) => a.done - b.done || new Date(a.deadline || '9999') - new Date(b.deadline || '9999'))
})

function openAdd() {
  editingId.value = null
  form.value = { title: '', category: '', priority: 'medium', deadline: '', done: false, note: '' }
  showForm.value = true
}
function openEdit(todo) {
  editingId.value = todo.id
  form.value = { ...todo }
  showForm.value = true
}
function save() {
  if (!form.value.title) return
  if (editingId.value) tools.updateTodo(editingId.value, form.value)
  else tools.addTodo(form.value)
  showForm.value = false
}

const priorityColors = { high: 'red', medium: 'orange', low: 'green' }
const priorityLabels = { high: '高', medium: '中', low: '低' }
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">✅ 通用待办</h2>
      <Btn @click="openAdd">+ 添加待办</Btn>
    </div>

    <div v-if="tools.todos.length > 0" class="flex flex-wrap gap-2 mb-4">
      <select v-model="filterCategory" class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">
        <option value="">全部分类</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="filterPriority" class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">
        <option value="">全部优先级</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>
      <select v-model="filterStatus" class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">
        <option value="all">全部状态</option>
        <option value="undone">未完成</option>
        <option value="done">已完成</option>
      </select>
    </div>

    <EmptyState v-if="filtered.length === 0" icon="✅" text="没有待办事项" />

    <div v-else class="space-y-2">
      <div v-for="todo in filtered" :key="todo.id" :class="['p-4 rounded-xl border cursor-pointer transition-all', todo.done ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-60' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:shadow-md']" @click="openEdit(todo)">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <input type="checkbox" :checked="todo.done" @click.stop="tools.toggleTodoDone(todo.id)" class="w-5 h-5 rounded accent-blue-500" />
            <Tag :color="priorityColors[todo.priority]">{{ priorityLabels[todo.priority] }}</Tag>
            <span class="font-medium text-gray-800 dark:text-white" :class="{ 'line-through': todo.done }">{{ todo.title }}</span>
            <Tag v-if="todo.category" color="blue">{{ todo.category }}</Tag>
          </div>
          <span v-if="todo.deadline" :class="isSameDay(todo.deadline, today()) ? 'text-red-500 font-medium text-sm' : 'text-gray-400 text-sm'">{{ todo.deadline }}</span>
        </div>
        <p v-if="todo.note" class="mt-2 text-sm text-gray-500">{{ todo.note }}</p>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑待办' : '添加待办'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">标题</label>
          <input v-model="form.title" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="待办内容" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">分类</label>
            <input v-model="form.category" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：学习" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">优先级</label>
            <select v-model="form.priority" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">截止时间</label>
            <input type="date" v-model="form.deadline" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">备注</label>
          <textarea v-model="form.note" rows="2" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"></textarea>
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="tools.removeTodo(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>