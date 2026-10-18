<script setup>
import { ref } from 'vue'
import { useClubStore } from '../../stores/club'
import { formatDate } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const club = useClubStore()
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '', role: '成员', joinDate: '', note: '' })

function openAdd() {
  editingId.value = null
  form.value = { name: '', role: '成员', joinDate: formatDate(new Date()), note: '' }
  showForm.value = true
}
function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item }
  showForm.value = true
}
function save() {
  if (!form.value.name) return
  if (editingId.value) club.updateClub(editingId.value, form.value)
  else club.addClub(form.value)
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">👥 我的社团</h2>
      <Btn @click="openAdd">+ 添加社团</Btn>
    </div>

    <EmptyState v-if="club.clubs.length === 0" icon="👥" text="还没有加入社团" />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="item in club.clubs" :key="item.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all" @click="openEdit(item)">
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-gray-800 dark:text-white">{{ item.name }}</span>
          <Tag color="pink">{{ item.role || '成员' }}</Tag>
        </div>
        <p v-if="item.joinDate" class="text-sm text-gray-400">加入时间：{{ item.joinDate }}</p>
        <p v-if="item.note" class="text-sm text-gray-500 mt-1">{{ item.note }}</p>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑社团' : '添加社团'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">社团名称</label>
          <input v-model="form.name" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：编程社" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">职务</label>
            <input v-model="form.role" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：部长" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">加入时间</label>
            <input type="date" v-model="form.joinDate" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">备注</label>
          <input v-model="form.note" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="club.removeClub(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>