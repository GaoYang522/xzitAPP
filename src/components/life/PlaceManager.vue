<script setup>
import { ref, computed } from 'vue'
import { useLifeStore } from '../../stores/life'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const life = useLifeStore()
const showForm = ref(false)
const editingId = ref(null)
const filterCategory = ref('')
const form = ref({ name: '', category: 'other', location: '', note: '' })

const categoryColors = { building: 'blue', canteen: 'orange', express: 'green', print: 'purple', other: 'gray' }
const categoryLabels = { building: '教学楼', canteen: '食堂', express: '快递点', print: '打印店', other: '其他' }

const filtered = computed(() =>
  life.places.filter((p) => !filterCategory.value || p.category === filterCategory.value)
)

function openAdd() {
  editingId.value = null
  form.value = { name: '', category: 'other', location: '', note: '' }
  showForm.value = true
}
function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item }
  showForm.value = true
}
function save() {
  if (!form.value.name) return
  if (editingId.value) life.updatePlace(editingId.value, form.value)
  else life.addPlace(form.value)
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">📍 常用地点</h2>
      <Btn @click="openAdd">+ 添加</Btn>
    </div>

    <div v-if="life.places.length > 0" class="flex gap-2 mb-4">
      <select v-model="filterCategory" class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">
        <option value="">全部分类</option>
        <option v-for="(label, key) in categoryLabels" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <EmptyState v-if="filtered.length === 0" icon="📍" text="还没有常用地点" />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="item in filtered" :key="item.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all" @click="openEdit(item)">
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold text-gray-800 dark:text-white">{{ item.name }}</span>
          <Tag :color="categoryColors[item.category]">{{ categoryLabels[item.category] }}</Tag>
        </div>
        <p v-if="item.location" class="text-sm text-gray-500">{{ item.location }}</p>
        <p v-if="item.note" class="text-sm text-gray-400 mt-1">{{ item.note }}</p>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑地点' : '添加地点'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">地点名称</label>
          <input v-model="form.name" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：第三教学楼" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">类别</label>
          <select v-model="form.category" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
            <option v-for="(label, key) in categoryLabels" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">位置描述</label>
          <input v-model="form.location" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：东门附近" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">备注</label>
          <input v-model="form.note" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="life.removePlace(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>