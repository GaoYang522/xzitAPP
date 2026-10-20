<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useStudyStore } from '../stores/study'
import { useToolsStore } from '../stores/tools'
import { useLifeStore } from '../stores/life'
import { useClubStore } from '../stores/club'
import { useHealthStore } from '../stores/health'
import { useAssistantStore } from '../stores/assistant'
import {
  exportAllData,
  importAllData,
  clearModule,
  clearAll,
  generateBackupFilename,
  downloadJSON,
} from '../utils/exportImport'
import SectionTitle from '../components/common/SectionTitle.vue'
import AppCard from '../components/common/AppCard.vue'
import Btn from '../components/common/Btn.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'

const settings = useSettingsStore()
const study = useStudyStore()
const tools = useToolsStore()
const life = useLifeStore()
const club = useClubStore()
const health = useHealthStore()
const assistant = useAssistantStore()

const dataOverview = computed(() => [
  { name: '课程', count: study.courses.length },
  { name: '作业', count: study.homework.length },
  { name: '考试', count: study.exams.length },
  { name: '成绩', count: study.grades.length },
  { name: '一卡通记录', count: life.cardRecords.length },
  { name: '食堂备忘', count: life.canteen.length },
  { name: '常用地点', count: life.places.length },
  { name: '快递', count: life.packages.length },
  { name: '社团', count: club.clubs.length },
  { name: '社团活动', count: club.activities.length },
  { name: '校园动态', count: club.posts.length },
  { name: '健康打卡', count: health.checkins.length },
  { name: '体测数据', count: health.fitness.length },
  { name: '运动记录', count: health.exercises.length },
  { name: '心情记录', count: health.moods.length },
  { name: '待办', count: tools.todos.length },
  { name: '备忘录', count: tools.notes.length },
  { name: '倒计时', count: tools.countdowns.length },
  { name: '习惯', count: tools.habits.length },
  { name: 'AI 助手会话', count: assistant.sessionCount },
])

const totalRecords = computed(() => dataOverview.value.reduce((sum, item) => sum + item.count, 0))

const fileInput = ref(null)
const confirmShow = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref(null)
const exportConfirmShow = ref(false)

function handleExport() {
  exportConfirmShow.value = true
}

function handleExportConfirm(includeApiKey) {
  const data = exportAllData(includeApiKey)
  downloadJSON(data, generateBackupFilename())
  exportConfirmShow.value = false
}

function handleImportClick() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (!data.version) throw new Error('无效格式')
      confirmTitle.value = '导入数据'
      confirmMessage.value = '确定要导入备份文件吗？这将覆盖当前所有数据。'
      confirmAction.value = () => {
        importAllData(data)
        confirmShow.value = false
      }
      confirmShow.value = true
    } catch (err) {
      alert('文件格式无效：' + err.message)
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

const moduleLabels = { study: '学业学习', tools: '工具备忘', life: '校园生活', club: '社团社交', health: '健康管理', assistant: 'AI 助手' }

function handleClearModule(moduleName) {
  confirmTitle.value = '清空数据'
  confirmMessage.value = `确定要清空「${moduleLabels[moduleName]}」的所有数据吗？此操作不可撤销。`
  confirmAction.value = () => {
    clearModule(moduleName)
    confirmShow.value = false
  }
  confirmShow.value = true
}

function handleClearAll() {
  confirmTitle.value = '清空所有数据'
  confirmMessage.value = '确定要清空所有模块的数据吗？此操作不可撤销！'
  confirmAction.value = () => {
    clearAll()
    confirmShow.value = false
  }
  confirmShow.value = true
}

function handleConfirm() {
  if (confirmAction.value) confirmAction.value()
}
</script>

<template>
  <div class="space-y-6">
    <SectionTitle title="学期设置" icon="📅" />
    <AppCard>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">学期开始日期</label>
          <input type="date" v-model="settings.semesterStart" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">总周数</label>
          <input type="number" min="1" max="30" :value="settings.totalWeeks" @input="settings.setTotalWeeks($event.target.value)" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
      </div>
    </AppCard>

    <SectionTitle title="主题" icon="🎨" />
    <AppCard>
      <div class="flex items-center justify-between">
        <span class="text-gray-600 dark:text-gray-300">当前主题</span>
        <Btn variant="secondary" @click="settings.toggleTheme()">
          {{ settings.theme === 'light' ? '🌙 切换到深色' : '☀️ 切换到浅色' }}
        </Btn>
      </div>
    </AppCard>

    <SectionTitle title="数据概览" icon="📊" />
    <AppCard>
      <p class="text-sm text-gray-500 mb-4">共 {{ totalRecords }} 条数据</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div v-for="item in dataOverview" :key="item.name" class="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50">
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ item.name }}</span>
          <span class="font-bold text-gray-800 dark:text-white">{{ item.count }}</span>
        </div>
      </div>
    </AppCard>

    <SectionTitle title="数据管理" icon="💾" />
    <AppCard>
      <div class="space-y-4">
        <div class="flex gap-2">
          <Btn variant="success" @click="handleExport">📥 导出备份</Btn>
          <Btn variant="secondary" @click="handleImportClick">📤 导入恢复</Btn>
          <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleFileSelect" />
        </div>
        <div class="border-t border-gray-100 dark:border-gray-700 pt-4">
          <p class="text-sm text-gray-500 mb-3">按模块清空数据：</p>
          <div class="flex flex-wrap gap-2">
            <Btn v-for="(label, key) in moduleLabels" :key="key" variant="ghost" size="sm" @click="handleClearModule(key)">清空{{ label }}</Btn>
          </div>
          <div class="mt-4">
            <Btn variant="danger" @click="handleClearAll">⚠️ 清空所有数据</Btn>
          </div>
        </div>
      </div>
    </AppCard>

    <SectionTitle title="关于" icon="ℹ️" />
    <AppCard>
      <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <p><strong>应用名称：</strong>校园一站式 APP</p>
        <p><strong>版本：</strong>v2.0.0</p>
        <p><strong>说明：</strong>大学生校园生活一站式管理工具，集成 AI 助手，数据本地保存。</p>
      </div>
    </AppCard>

    <ConfirmDialog
      :show="confirmShow"
      :title="confirmTitle"
      :message="confirmMessage"
      @confirm="handleConfirm"
      @cancel="confirmShow = false"
    />

    <ConfirmDialog
      :show="exportConfirmShow"
      title="导出备份"
      message="是否在备份中包含 API Key？（包含存在安全风险，建议不包含）"
      @confirm="handleExportConfirm(false)"
      @cancel="exportConfirmShow = false"
    >
      <template #extra>
        <button class="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600" @click="handleExportConfirm(true)">包含 API Key</button>
      </template>
    </ConfirmDialog>
  </div>
</template>