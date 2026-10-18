<script setup>
import { ref, computed } from 'vue'
import { useHealthStore } from '../../stores/health'
import { formatDate } from '../../composables/useDate'
import { calculateBMI, getBMICategory } from '../../utils/bmi'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import Tag from '../common/Tag.vue'

const health = useHealthStore()
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ date: '', height: '', weight: '', run50: '', run800: '', strength: '', reach: '', note: '' })

const sorted = computed(() =>
  [...health.fitness].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
)

const currentBMI = computed(() => {
  if (!form.value.height || !form.value.weight) return 0
  return calculateBMI(Number(form.value.weight), Number(form.value.height))
})

function openAdd() {
  editingId.value = null
  form.value = { date: formatDate(new Date()), height: '', weight: '', run50: '', run800: '', strength: '', reach: '', note: '' }
  showForm.value = true
}
function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item }
  showForm.value = true
}
function save() {
  if (!form.value.date) return
  form.value.height = Number(form.value.height)
  form.value.weight = Number(form.value.weight)
  if (editingId.value) health.updateFitness(editingId.value, form.value)
  else health.addFitness(form.value)
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">💪 体测数据</h2>
      <Btn @click="openAdd">+ 录入数据</Btn>
    </div>

    <EmptyState v-if="sorted.length === 0" icon="💪" text="还没有体测数据" />

    <div v-else class="space-y-2">
      <div v-for="item in sorted" :key="item.id" class="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer transition-all" @click="openEdit(item)">
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-gray-800 dark:text-white">{{ item.date }}</span>
          <div v-if="item.height && item.weight" class="flex items-center gap-2">
            <Tag color="blue">BMI {{ calculateBMI(item.weight, item.height) }}</Tag>
            <Tag color="gray">{{ getBMICategory(calculateBMI(item.weight, item.height)) }}</Tag>
          </div>
        </div>
        <div class="flex flex-wrap gap-3 text-sm text-gray-500">
          <span v-if="item.height">身高 {{ item.height }}m</span>
          <span v-if="item.weight">体重 {{ item.weight }}kg</span>
          <span v-if="item.run50">50m {{ item.run50 }}s</span>
          <span v-if="item.run800">800m {{ item.run800 }}</span>
          <span v-if="item.strength">力量 {{ item.strength }}</span>
        </div>
      </div>
    </div>

    <Modal :show="showForm" :title="editingId ? '编辑体测' : '录入体测'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">日期</label>
          <input type="date" v-model="form.date" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">身高(m)</label>
            <input type="number" step="0.01" v-model="form.height" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="1.75" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">体重(kg)</label>
            <input type="number" step="0.1" v-model="form.weight" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="70" />
          </div>
        </div>
        <div v-if="currentBMI > 0" class="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
          <span class="text-sm text-gray-500">BMI: </span>
          <span class="font-bold text-blue-500">{{ currentBMI }}</span>
          <span class="text-sm text-gray-400 ml-2">{{ getBMICategory(currentBMI) }}</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">50米跑(s)</label>
            <input v-model="form.run50" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">800/1000米</label>
            <input v-model="form.run800" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：3'30''" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">引体/仰卧</label>
            <input v-model="form.strength" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：15个" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">坐位体前屈</label>
            <input v-model="form.reach" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：15cm" />
          </div>
        </div>
      </div>
      <template #footer>
        <Btn variant="danger" v-if="editingId" @click="health.removeFitness(editingId); showForm = false">删除</Btn>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>