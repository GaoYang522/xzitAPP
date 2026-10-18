<script setup>
import { ref, computed } from 'vue'
import { useToolsStore } from '../../stores/tools'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const tools = useToolsStore()
const showForm = ref(false)
const editingId = ref(null)
const searchQuery = ref('')
const form = ref({ title: '', content: '', category: '' })

const filtered = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return tools.notes.filter((n) => {
    if (!q) return true
    return n.title.toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
  })
})

function openAdd() {
  editingId.value = null
  form.value = { title: '', content: '', category: '' }
  showForm.value = true
}
function openEdit(note) {
  editingId.value = note.id
  form.value = { ...note }
  showForm.value = true
}
function save() {
  if (!form.value.title) return
  if (editingId.value) tools.updateNote(editingId.value, form.value)
  else tools.addNote(form.value)
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">📒 备忘录</h2>
      <Btn @click="openAdd">+ 新建备忘</Btn>
    </div>

    <div v-if="tools.notes.length > 0" class="mb-4">
      <input v-model="searchQuery" placeholder="🔍 搜索备忘录..." class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
    </div>

    <EmptyState v-if="filtered.length === 0" icon="📒" text="没有备忘录" />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="note in filtered" :key="note.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all" @click="openEdit(note)">
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-gray-800 dark:text-white">{{ note.title }}</span>
          <Tag v-if="note.category" color="purple">{{ note.category }}</Tag>
        </div>
        <p class="text-sm text-gray-500 line-clamp-3">{{ note.content }}</p>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑备忘' : '新建备忘'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">标题</label>
          <input v-model="form.title" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">分类</label>
          <input v-model="form.category" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：学习笔记" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">内容</label>
          <textarea v-model="form.content" rows="6" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"></textarea>
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="tools.removeNote(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>