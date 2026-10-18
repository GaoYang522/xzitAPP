import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Tools from '../src/views/Tools.vue'
import TodoManager from '../src/components/tools/TodoManager.vue'
import NoteManager from '../src/components/tools/NoteManager.vue'
import CountdownManager from '../src/components/tools/CountdownManager.vue'
import HabitManager from '../src/components/tools/HabitManager.vue'
import { useToolsStore } from '../src/stores/tools'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('Tools 页面', () => {
  test('渲染 4 个标签', () => {
    const wrapper = mount(Tools)
    expect(wrapper.text()).toContain('待办')
    expect(wrapper.text()).toContain('备忘录')
    expect(wrapper.text()).toContain('倒计时')
    expect(wrapper.text()).toContain('习惯')
  })

  test('默认显示待办管理', () => {
    const wrapper = mount(Tools)
    expect(wrapper.findComponent(TodoManager).exists()).toBe(true)
  })
})

describe('TodoManager 待办管理', () => {
  test('空状态显示提示', () => {
    const wrapper = mount(TodoManager)
    expect(wrapper.text()).toContain('没有待办事项')
  })

  test('待办列表显示内容', () => {
    const store = useToolsStore()
    store.addTodo({ title: '买书', priority: 'high', category: '生活' })
    const wrapper = mount(TodoManager)
    expect(wrapper.text()).toContain('买书')
    expect(wrapper.text()).toContain('生活')
  })
})

describe('NoteManager 备忘录', () => {
  test('空状态显示提示', () => {
    const wrapper = mount(NoteManager)
    expect(wrapper.text()).toContain('没有备忘录')
  })

  test('备忘录显示内容', () => {
    const store = useToolsStore()
    store.addNote({ title: '学习笔记', content: 'Vue3知识点', category: '前端' })
    const wrapper = mount(NoteManager)
    expect(wrapper.text()).toContain('学习笔记')
    expect(wrapper.text()).toContain('Vue3知识点')
  })
})

describe('CountdownManager 倒计时', () => {
  test('空状态显示提示', () => {
    const wrapper = mount(CountdownManager)
    expect(wrapper.text()).toContain('没有倒计时')
  })

  test('倒计时显示天数', () => {
    const store = useToolsStore()
    store.addCountdown({ name: '期末考试', date: '2026-12-01', category: 'exam' })
    const wrapper = mount(CountdownManager)
    expect(wrapper.text()).toContain('期末考试')
    expect(wrapper.text()).toContain('天')
  })
})

describe('HabitManager 习惯打卡', () => {
  test('空状态显示提示', () => {
    const wrapper = mount(HabitManager)
    expect(wrapper.text()).toContain('还没有习惯')
  })

  test('习惯显示连续天数', () => {
    const store = useToolsStore()
    store.addHabit({ name: '早起', frequency: 'daily', checkins: [] })
    const wrapper = mount(HabitManager)
    expect(wrapper.text()).toContain('早起')
    expect(wrapper.text()).toContain('天连续')
  })
})