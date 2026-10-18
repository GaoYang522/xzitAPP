<script setup>
import { ref, computed } from 'vue'
import { useClubStore } from '../../stores/club'
import { daysBetween, today } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const club = useClubStore()
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '', clubName: '', date: '', location: '', status: 'unregistered', note: '' })

const statusColors = { unregistered: 'gray', registered: 'blue', attended: 'green' }
const statusLabels = { unregistered: '未报名', registered: '已报名', attended: '已参加' }

const sorted = computed(() =>
  [...club.activities].sort((a, b) => new Date(a.date || '9999') - new Date(b.date || '9999'))
)

function openAdd() {
  editingId.value = null
  form.value = { name: '', clubName: '', date: '', location: '', status: 'unregistered', note: '' }
  showForm.value = true
}
function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item }
  showForm.value = true
}
function save() {
  if (!form.value.name) return
  if (editingId.value) club.updateActivity(editingId.value, form.value)
  else club.addActivity(form.value)
  showForm.value = false
}
function cycleStatus(item) {
  const order = ['unregistered', 'registered', 'attended']
  const idx = order.indexOf(item.status)
  club.updateActivity(item.id, { status: order[(idx + 1) % 3] })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">📅 社团活动</h2>
      <Btn @click="openAdd">+ 添加活动</Btn>
    </div>

    <EmptyState v-if="sorted.length === 0" icon="📅" text="没有社团活动" />

    <div v-else class="space-y-2">
      <div v-for="item in sorted" :key="item.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all" @click="openEdit(item)">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-800 dark:text-white">{{ item.name }}</span>
            <Tag v-if="item.clubName" color="purple">{{ item.clubName }}</Tag>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="item.date" class="text-sm text-gray-400">{{ item.date }}</span>
            <button @click.stop="cycleStatus(item)">
              <Tag :color="statusColors[item.status]">{{ statusLabels[item.status] }}</Tag>
            </button>
          </div>
        </div>
        <div class="flex items-center gap-3 mt-2">
          <span v-if="item.location" class="text-sm text-gray-400">📍 {{ item.location }}</span>
          <span v-if="item.date && daysBetween(today(), item.date) >= 0" class="text-sm text-blue-500">还有 {{ daysBetween(today(), item.date) }} 天</span>
        </div>
        <p v-if="item.note" class="mt-1 text-sm text-gray-500">{{ item.note }}</p>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑活动' : '添加活动'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">活动名称</label>
          <input v-model="form.name" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">所属社团</label>
            <input v-model="form.clubName" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">时间</label>
            <input type="date" v-model="form.date" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">地点</label>
            <input v-model="form.location" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">报名状态</label>
            <select v-model="form.status" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option value="unregistered">未报名</option>
              <option value="registered">已报名</option>
              <option value="attended">已参加</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">备注</label>
          <input v-model="form.note" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="club.removeActivity(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>