<script setup>
import { ref, computed } from 'vue'
import { useLifeStore } from '../../stores/life'
import { formatDate } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const life = useLifeStore()
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ code: '', pickupCode: '', location: '', date: '' })

const pending = computed(() => life.packages.filter((p) => !p.taken))
const taken = computed(() => life.packages.filter((p) => p.taken))

function openAdd() {
  editingId.value = null
  form.value = { code: '', pickupCode: '', location: '', date: formatDate(new Date()) }
  showForm.value = true
}
function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item }
  showForm.value = true
}
function save() {
  if (!form.value.code) return
  if (editingId.value) life.updatePackage(editingId.value, form.value)
  else life.addPackage({ ...form.value, taken: false })
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">📦 快递提醒</h2>
      <Btn @click="openAdd">+ 添加快递</Btn>
    </div>

    <EmptyState v-if="life.packages.length === 0" icon="📦" text="没有快递" />

    <div v-else class="space-y-4">
      <div v-if="pending.length > 0">
        <h3 class="text-sm font-medium text-gray-500 mb-2">待取 ({{ pending.length }})</h3>
        <div class="space-y-2">
          <div v-for="item in pending" :key="item.id" class="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 flex items-center justify-between">
            <div class="cursor-pointer" @click="openEdit(item)">
              <span class="font-semibold text-gray-800 dark:text-white">{{ item.code }}</span>
              <span v-if="item.pickupCode" class="text-sm text-orange-600 ml-2">取件码: {{ item.pickupCode }}</span>
              <span v-if="item.location" class="text-sm text-gray-400 ml-2">{{ item.location }}</span>
            </div>
            <Btn size="sm" variant="success" @click="life.togglePackageTaken(item.id)">已取</Btn>
          </div>
        </div>
      </div>

      <div v-if="taken.length > 0">
        <h3 class="text-sm font-medium text-gray-400 mb-2">已取 ({{ taken.length }})</h3>
        <div class="space-y-2">
          <div v-for="item in taken" :key="item.id" class="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 opacity-60 flex items-center justify-between">
            <span class="text-gray-500">{{ item.code }}</span>
            <button @click="life.removePackage(item.id)" class="text-gray-300 hover:text-red-500 text-sm">✕</button>
          </div>
        </div>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑快递' : '添加快递'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">单号</label>
          <input v-model="form.code" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：SF1234567890" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">取件码</label>
            <input v-model="form.pickupCode" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：1-2-3" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">取件地点</label>
            <input v-model="form.location" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：菜鸟驿站" />
          </div>
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="life.removePackage(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>