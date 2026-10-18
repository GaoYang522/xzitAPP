<script setup>
import { ref, computed } from 'vue'
import { useLifeStore } from '../../stores/life'
import { formatDate } from '../../composables/useDate'
import Btn from '../common/Btn.vue'
import Modal from '../common/Modal.vue'
import EmptyState from '../common/EmptyState.vue'
import AppCard from '../common/AppCard.vue'

const life = useLifeStore()
const showForm = ref(false)
const form = ref({ type: 'expense', amount: 0, location: '', note: '' })

const sortedRecords = computed(() =>
  [...life.cardRecords].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
)

function openAdd(type) {
  form.value = { type, amount: 0, location: '', note: '' }
  showForm.value = true
}

function save() {
  if (!form.value.amount || form.value.amount <= 0) return
  life.addCardRecord({ ...form.value, amount: Number(form.value.amount), date: formatDate(new Date()) })
  showForm.value = false
}
</script>

<template>
  <div>
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4">💳 一卡通</h2>

    <AppCard class="mb-4" gradient="bg-grad-blue">
      <div class="text-center py-4">
        <p class="text-sm text-white/80 mb-1">当前余额</p>
        <p class="text-4xl font-bold text-white">¥ {{ life.cardBalance.toFixed(2) }}</p>
      </div>
    </AppCard>

    <div class="flex gap-2 mb-4">
      <Btn variant="danger" @click="openAdd('expense')">- 消费</Btn>
      <Btn variant="success" @click="openAdd('income')">+ 充值</Btn>
    </div>

    <EmptyState v-if="sortedRecords.length === 0" icon="💳" text="还没有消费记录" />

    <div v-else class="space-y-2">
      <div v-for="record in sortedRecords" :key="record.id" class="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <div>
          <span class="font-medium" :class="record.type === 'expense' ? 'text-red-500' : 'text-green-500'">
            {{ record.type === 'expense' ? '-' : '+' }}¥{{ Number(record.amount).toFixed(2) }}
          </span>
          <span v-if="record.location" class="text-sm text-gray-400 ml-2">{{ record.location }}</span>
          <span v-if="record.note" class="text-sm text-gray-400 ml-2">{{ record.note }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400">{{ record.date }}</span>
          <button @click="life.removeCardRecord(record.id)" class="text-gray-300 hover:text-red-500 text-sm">✕</button>
        </div>
      </div>
    </div>

    <Modal :show="showForm" :title="form.type === 'expense' ? '记一笔消费' : '充值'" @close="showForm = false">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">金额</label>
          <input type="number" min="0" step="0.01" v-model="form.amount" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="0.00" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{{ form.type === 'expense' ? '消费地点' : '充值来源' }}</label>
          <input v-model="form.location" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" placeholder="如：食堂" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">备注</label>
          <input v-model="form.note" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
      </div>
      <template #footer>
        <Btn variant="secondary" @click="showForm = false">取消</Btn>
        <Btn @click="save">保存</Btn>
      </template>
    </Modal>
  </div>
</template>