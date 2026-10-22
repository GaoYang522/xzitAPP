import { setActivePinia, createPinia } from 'pinia'
import { describe, test, expect, beforeEach } from 'vitest'
import { usePomodoroStore } from '../src/stores/pomodoro.js'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('pomodoro store - settings', () => {
  test('默认设置', () => {
    const store = usePomodoroStore()
    expect(store.settings.focusDuration).toBe(25)
    expect(store.settings.breakDuration).toBe(5)
    expect(store.settings.longBreakDuration).toBe(15)
    expect(store.settings.cyclesBeforeLongBreak).toBe(4)
  })

  test('updateSettings修改设置', () => {
    const store = usePomodoroStore()
    store.updateSettings({ focusDuration: 30, breakDuration: 10 })
    expect(store.settings.focusDuration).toBe(30)
    expect(store.settings.breakDuration).toBe(10)
    expect(store.settings.longBreakDuration).toBe(15)
  })
})

describe('pomodoro store - recordSession', () => {
  test('记录专注会话', () => {
    const store = usePomodoroStore()
    const session = store.recordSession({ subject: '高数', duration: 25, type: 'focus' })
    expect(session.subject).toBe('高数')
    expect(session.duration).toBe(25)
    expect(session.type).toBe('focus')
    expect(session.completedAt).toBeTruthy()
    expect(store.sessions).toHaveLength(1)
    expect(store.currentCycle).toBe(1)
  })

  test('记录休息会话不增加cycle', () => {
    const store = usePomodoroStore()
    store.recordSession({ subject: '休息', duration: 5, type: 'break' })
    expect(store.currentCycle).toBe(0)
  })

  test('多次专注cycle递增', () => {
    const store = usePomodoroStore()
    store.recordSession({ subject: '高数', duration: 25, type: 'focus' })
    store.recordSession({ subject: '英语', duration: 25, type: 'focus' })
    store.recordSession({ subject: '物理', duration: 25, type: 'focus' })
    expect(store.currentCycle).toBe(3)
  })

  test('默认subject为未命名', () => {
    const store = usePomodoroStore()
    const session = store.recordSession({ duration: 25, type: 'focus' })
    expect(session.subject).toBe('未命名')
  })
})

describe('pomodoro store - 统计', () => {
  test('todaySessions返回今天的会话', () => {
    const store = usePomodoroStore()
    store.recordSession({ subject: '高数', duration: 25, type: 'focus' })
    store.recordSession({ subject: '英语', duration: 25, type: 'focus' })
    expect(store.todaySessions).toHaveLength(2)
  })

  test('todayTotalMinutes计算今日总时长', () => {
    const store = usePomodoroStore()
    store.recordSession({ subject: '高数', duration: 25, type: 'focus' })
    store.recordSession({ subject: '英语', duration: 30, type: 'focus' })
    store.recordSession({ subject: '休息', duration: 5, type: 'break' })
    expect(store.todayTotalMinutes).toBe(55)
  })

  test('todaySessionCount计算今日专注次数', () => {
    const store = usePomodoroStore()
    store.recordSession({ subject: '高数', duration: 25, type: 'focus' })
    store.recordSession({ subject: '英语', duration: 25, type: 'focus' })
    store.recordSession({ subject: '休息', duration: 5, type: 'break' })
    expect(store.todaySessionCount).toBe(2)
  })

  test('weekTotalMinutes计算本周总时长', () => {
    const store = usePomodoroStore()
    store.recordSession({ subject: '高数', duration: 25, type: 'focus' })
    store.recordSession({ subject: '英语', duration: 35, type: 'focus' })
    expect(store.weekTotalMinutes).toBe(60)
  })

  test('getStatsByDay返回指定日期统计', () => {
    const store = usePomodoroStore()
    store.recordSession({ subject: '高数', duration: 25, type: 'focus' })
    store.recordSession({ subject: '高数', duration: 30, type: 'focus' })
    store.recordSession({ subject: '英语', duration: 20, type: 'focus' })
    const stats = store.getStatsByDay(new Date())
    expect(stats.count).toBe(3)
    expect(stats.totalMinutes).toBe(75)
    expect(stats.subjects['高数']).toBe(55)
    expect(stats.subjects['英语']).toBe(20)
  })
})

describe('pomodoro store - clearHistory', () => {
  test('清空历史', () => {
    const store = usePomodoroStore()
    store.recordSession({ subject: '高数', duration: 25, type: 'focus' })
    store.recordSession({ subject: '英语', duration: 25, type: 'focus' })
    expect(store.sessions).toHaveLength(2)
    store.clearHistory()
    expect(store.sessions).toHaveLength(0)
    expect(store.currentCycle).toBe(0)
  })
})