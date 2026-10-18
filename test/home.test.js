import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import Home from '../src/views/Home.vue'
import TodaySchedule from '../src/components/home/TodaySchedule.vue'
import TodayTodos from '../src/components/home/TodayTodos.vue'
import SummaryCards from '../src/components/home/SummaryCards.vue'
import QuickActions from '../src/components/home/QuickActions.vue'
import { useStudyStore } from '../src/stores/study'
import { useToolsStore } from '../src/stores/tools'
import { useSettingsStore } from '../src/stores/settings'

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

function todayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('Home 页面', () => {
  test('渲染标题和区块', () => {
    const router = createTestRouter()
    const wrapper = mount(Home, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('首页总览')
    expect(wrapper.text()).toContain('快捷入口')
    expect(wrapper.text()).toContain('今日课表')
    expect(wrapper.text()).toContain('今日待办')
  })
})

describe('TodaySchedule 今日课表', () => {
  test('无学期设置时提示', () => {
    const wrapper = mount(TodaySchedule)
    expect(wrapper.text()).toContain('请先在设置')
  })

  test('显示今日课程', () => {
    const settings = useSettingsStore()
    const past = new Date()
    past.setDate(past.getDate() - 7)
    settings.semesterStart = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`

    const study = useStudyStore()
    const today = new Date()
    let w = today.getDay()
    w = w === 0 ? 7 : w
    study.addCourse({ name: '高数', day: w, startSection: 1, endSection: 2, location: '教1', startWeek: 1, endWeek: 16, color: 'blue' })

    const wrapper = mount(TodaySchedule)
    expect(wrapper.text()).toContain('高数')
  })
})

describe('TodayTodos 今日待办', () => {
  test('空状态', () => {
    const wrapper = mount(TodayTodos)
    expect(wrapper.text()).toContain('今天没有待办')
  })

  test('显示今日到期的作业和待办', () => {
    const ts = todayStr()
    const study = useStudyStore()
    study.addHomework({ subject: '高数', content: '习题1', deadline: ts, done: false, priority: 'high' })
    const tools = useToolsStore()
    tools.addTodo({ title: '买书', deadline: ts, done: false, priority: 'medium' })

    const wrapper = mount(TodayTodos)
    expect(wrapper.text()).toContain('习题1')
    expect(wrapper.text()).toContain('买书')
  })
})

describe('SummaryCards 摘要卡片', () => {
  test('渲染各模块摘要', () => {
    const wrapper = mount(SummaryCards)
    expect(wrapper.text()).toContain('学业')
    expect(wrapper.text()).toContain('校园生活')
    expect(wrapper.text()).toContain('社团')
    expect(wrapper.text()).toContain('健康')
    expect(wrapper.text()).toContain('工具')
  })
})

describe('QuickActions 快捷入口', () => {
  test('渲染快捷按钮', () => {
    const router = createTestRouter()
    const wrapper = mount(QuickActions, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('添加课程')
    expect(wrapper.text()).toContain('添加待办')
    expect(wrapper.text()).toContain('今日打卡')
    expect(wrapper.text()).toContain('记一笔消费')
  })
})