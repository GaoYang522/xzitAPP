import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Health from '../src/views/Health.vue'
import CheckinManager from '../src/components/health/CheckinManager.vue'
import FitnessManager from '../src/components/health/FitnessManager.vue'
import ExerciseManager from '../src/components/health/ExerciseManager.vue'
import MoodManager from '../src/components/health/MoodManager.vue'
import { useHealthStore } from '../src/stores/health'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('Health 页面', () => {
  test('渲染 4 个标签', () => {
    const wrapper = mount(Health)
    expect(wrapper.text()).toContain('打卡')
    expect(wrapper.text()).toContain('体测')
    expect(wrapper.text()).toContain('运动')
    expect(wrapper.text()).toContain('心情')
  })

  test('默认显示打卡', () => {
    const wrapper = mount(Health)
    expect(wrapper.findComponent(CheckinManager).exists()).toBe(true)
  })
})

describe('CheckinManager 每日打卡', () => {
  test('空状态', () => {
    const wrapper = mount(CheckinManager)
    expect(wrapper.text()).toContain('还没有打卡记录')
  })

  test('显示打卡记录', () => {
    const store = useHealthStore()
    store.addCheckin({ date: '2026-10-16', mood: 4, sleepTime: '23:00', wakeTime: '07:00' })
    const wrapper = mount(CheckinManager)
    expect(wrapper.text()).toContain('2026-10-16')
  })
})

describe('FitnessManager 体测数据', () => {
  test('空状态', () => {
    const wrapper = mount(FitnessManager)
    expect(wrapper.text()).toContain('还没有体测数据')
  })

  test('显示体测和BMI', () => {
    const store = useHealthStore()
    store.addFitness({ date: '2026-10-16', height: 1.75, weight: 70 })
    const wrapper = mount(FitnessManager)
    expect(wrapper.text()).toContain('2026-10-16')
    expect(wrapper.text()).toContain('BMI')
  })
})

describe('ExerciseManager 运动记录', () => {
  test('空状态', () => {
    const wrapper = mount(ExerciseManager)
    expect(wrapper.text()).toContain('还没有运动记录')
  })

  test('显示运动记录', () => {
    const store = useHealthStore()
    store.addExercise({ date: '2026-10-16', type: '跑步', duration: 30, distance: 5 })
    const wrapper = mount(ExerciseManager)
    expect(wrapper.text()).toContain('跑步')
    expect(wrapper.text()).toContain('30')
  })
})

describe('MoodManager 心情记录', () => {
  test('空状态', () => {
    const wrapper = mount(MoodManager)
    expect(wrapper.text()).toContain('还没有心情记录')
  })

  test('显示心情记录', () => {
    const store = useHealthStore()
    store.addMood({ date: '2026-10-16', mood: 4, stress: 2 })
    const wrapper = mount(MoodManager)
    expect(wrapper.text()).toContain('2026-10-16')
  })
})