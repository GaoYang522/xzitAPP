import { setActivePinia, createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
import Home from '../src/views/Home.vue'
import { useStudyStore } from '../src/stores/study'
import { useToolsStore } from '../src/stores/tools'
import { useSettingsStore } from '../src/stores/settings'
import { useLifeStore } from '../src/stores/life'
import { getWeekday } from '../src/composables/useDate'

function setupPinia() {
  localStorage.clear()
  const pinia = createPinia()
  pinia._a = {}
  pinia.use(piniaPluginPersistedstate)
  setActivePinia(pinia)
}

function todayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
      { path: '/study', component: { template: '<div/>' } },
      { path: '/tools', component: { template: '<div/>' } },
      { path: '/health', component: { template: '<div/>' } },
      { path: '/life', component: { template: '<div/>' } },
    ],
  })
}

beforeEach(() => {
  setupPinia()
})

describe('首页联动验证', () => {
  test('今日课表从学业课表取数据', () => {
    const settings = useSettingsStore()
    const past = new Date()
    past.setDate(past.getDate() - 7)
    settings.semesterStart = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`

    const study = useStudyStore()
    const w = getWeekday()
    study.addCourse({ name: '高数', day: w, startSection: 1, endSection: 2, location: '教1', startWeek: 1, endWeek: 16, color: 'blue' })

    const router = createTestRouter()
    const wrapper = mount(Home, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('高数')
  })

  test('今日待办合并作业和通用待办', () => {
    const ts = todayStr()
    const study = useStudyStore()
    study.addHomework({ subject: '高数', content: '作业习题', deadline: ts, done: false, priority: 'high' })

    const tools = useToolsStore()
    tools.addTodo({ title: '买文具', deadline: ts, done: false, priority: 'medium' })

    const router = createTestRouter()
    const wrapper = mount(Home, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('作业习题')
    expect(wrapper.text()).toContain('买文具')
  })

  test('摘要卡片显示快递和余额', () => {
    const life = useLifeStore()
    life.addPackage({ code: 'SF123', taken: false })
    life.addCardRecord({ type: 'income', amount: 200, date: todayStr() })

    const router = createTestRouter()
    const wrapper = mount(Home, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('待取快递')
    expect(wrapper.text()).toContain('余额')
  })

  test('摘要卡片显示健康打卡状态', () => {
    const router = createTestRouter()
    const wrapper = mount(Home, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('未打卡')
  })
})

describe('数据持久化验证', () => {
  test('study store 自动同步到 localStorage', async () => {
    const study = useStudyStore()
    study.addCourse({ name: '高数', day: 1 })
    await nextTick()

    const stored = localStorage.getItem('study')
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored)
    expect(parsed.courses).toHaveLength(1)
    expect(parsed.courses[0].name).toBe('高数')
  })

  test('settings store 持久化', async () => {
    const settings = useSettingsStore()
    settings.setSemesterStart('2026-09-01')
    await nextTick()

    const stored = localStorage.getItem('settings')
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored)
    expect(parsed.semesterStart).toBe('2026-09-01')
  })

  test('tools store 持久化', async () => {
    const tools = useToolsStore()
    tools.addTodo({ title: '测试待办', priority: 'high' })
    await nextTick()

    const stored = localStorage.getItem('tools')
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored)
    expect(parsed.todos).toHaveLength(1)
  })

  test('刷新后数据从 localStorage 恢复', async () => {
    const study = useStudyStore()
    study.addCourse({ name: '线性代数', day: 2 })
    study.addHomework({ subject: '英语', content: '作文' })
    await nextTick()

    const stored = localStorage.getItem('study')
    expect(stored).toBeTruthy()

    const newPinia = createPinia()
    newPinia._a = {}
    newPinia.use(piniaPluginPersistedstate)
    setActivePinia(newPinia)

    const restoredStudy = useStudyStore()
    expect(restoredStudy.courses).toHaveLength(1)
    expect(restoredStudy.courses[0].name).toBe('线性代数')
    expect(restoredStudy.homework).toHaveLength(1)
    expect(restoredStudy.homework[0].subject).toBe('英语')
  })
})