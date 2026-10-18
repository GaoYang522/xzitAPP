import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '../src/stores/settings'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('settings store', () => {
  test('初始状态正确', () => {
    const store = useSettingsStore()
    expect(store.theme).toBe('light')
    expect(store.semesterStart).toBe('')
    expect(store.totalWeeks).toBe(20)
  })

  test('toggleTheme 切换主题', () => {
    const store = useSettingsStore()
    expect(store.theme).toBe('light')
    store.toggleTheme()
    expect(store.theme).toBe('dark')
    store.toggleTheme()
    expect(store.theme).toBe('light')
  })

  test('setSemesterStart 设置学期开始日期', () => {
    const store = useSettingsStore()
    store.setSemesterStart('2026-09-01')
    expect(store.semesterStart).toBe('2026-09-01')
  })

  test('setTotalWeeks 设置总周数并转为数字', () => {
    const store = useSettingsStore()
    store.setTotalWeeks('18')
    expect(store.totalWeeks).toBe(18)
    expect(typeof store.totalWeeks).toBe('number')
  })
})