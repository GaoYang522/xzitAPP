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
const filterRating = ref(0)
const form = ref({ name: '', price: 0, rating: 3, note: '', tags: '' })

const filtered = computed(() =>
  life.canteen.filter((c) => (c.rating || 0) >= filterRating.value)
)

function openAdd() {
  editingId.value = null
  form.value = { name: '', price: 0, rating: 3, note: '', tags: '' }
  showForm.value = true
}
function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item }
  showForm.value = true
}
function save() {
  if (!form.value.name) return
  form.value.price = Number(form.value.price)
  form.value.rating = Number(form.value.rating)
  if (editingId.value) life.updateCanteen(editingId.value, form.value)
  else life.addCanteen(form.value)
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">🍽️ 食堂备忘</h2>
      <Btn @click="openAdd">+ 添加</Btn>
    </div>

    <div v-if="life.canteen.length > 0" class="flex gap-2 mb-4">
      <select v-model="filterRating" class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">
        <option :value="0">全部评分</option>
        <option :value="4">4星及以上</option>
        <option :value="3">3星及以上</option>
      </select>
    </div>

    <EmptyState v-if="filtered.length === 0" icon="🍽️" text="还没有食堂备忘" />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="item in filtered" :key="item.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all" @click="openEdit(item)">
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold text-gray-800 dark:text-white">{{ item.name }}</span>
          <span class="text-yellow-400">{{ '★'.repeat(item.rating || 0) }}<span class="text-gray-300">{{ '★'.repeat(5 - (item.rating || 0)) }}</span></span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-orange-500 font-medium">¥{{ Number(item.price || 0).toFixed(0) }}</span>
          <Tag v-if="item.tags" color="orange">{{ item.tags }}</Tag>
        </div>
        <p v-if="item.note" class="mt-1 text-sm text-gray-500">{{ item.note }}</p>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑' : '添加食堂备忘'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">窗口/店名</label>
          <input v-model="form.name" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">价格</label>
            <input type="number" min="0" v-model="form.price" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">评分</label>
            <select v-model="form.rating" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option v-for="n in 5" :key="n" :value="n">{{ n }} 星</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">标签</label>
          <input v-model="form.tags" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：便宜量大" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">备注</label>
          <input v-model="form.note" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="life.removeCanteen(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>