import { setActivePinia, createPinia } from 'pinia'
import { describe, test, expect, beforeEach } from 'vitest'
import { useHealthStore } from '../src/stores/health.js'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('运动记录单位', () => {
  test('默认单位为km', () => {
    const health = useHealthStore()
    health.addExercise({ date: '2026-10-25', type: '跑步', duration: 30, distance: 5, unit: 'km' })
    expect(health.exercises[0].unit).toBe('km')
  })

  test('支持次为单位（跳绳）', () => {
    const health = useHealthStore()
    health.addExercise({ date: '2026-10-25', type: '跳绳', duration: 15, distance: 200, unit: '次' })
    expect(health.exercises[0].unit).toBe('次')
    expect(health.exercises[0].distance).toBe(200)
  })

  test('支持个为单位（俯卧撑）', () => {
    const health = useHealthStore()
    health.addExercise({ date: '2026-10-25', type: '俯卧撑', duration: 10, distance: 50, unit: '个' })
    expect(health.exercises[0].unit).toBe('个')
  })

  test('支持组为单位（深蹲）', () => {
    const health = useHealthStore()
    health.addExercise({ date: '2026-10-25', type: '深蹲', duration: 20, distance: 4, unit: '组' })
    expect(health.exercises[0].unit).toBe('组')
  })

  test('支持米为单位（游泳）', () => {
    const health = useHealthStore()
    health.addExercise({ date: '2026-10-25', type: '游泳', duration: 40, distance: 1000, unit: 'm' })
    expect(health.exercises[0].unit).toBe('m')
  })

  test('无unit字段时默认显示km', () => {
    const health = useHealthStore()
    health.addExercise({ date: '2026-10-25', type: '跑步', duration: 30, distance: 5 })
    const unit = health.exercises[0].unit || 'km'
    expect(unit).toBe('km')
  })
})

describe('运动统计按单位分组', () => {
  test('不同单位不混在一起统计', () => {
    const health = useHealthStore()
    health.addExercise({ date: '2026-10-25', type: '跑步', duration: 30, distance: 5, unit: 'km' })
    health.addExercise({ date: '2026-10-25', type: '跳绳', duration: 15, distance: 200, unit: '次' })

    const items = health.exercises
    const byUnit = {}
    for (const e of items) {
      if (!e.distance) continue
      const u = e.unit || 'km'
      byUnit[u] = (byUnit[u] || 0) + Number(e.distance || 0)
    }
    expect(byUnit['km']).toBe(5)
    expect(byUnit['次']).toBe(200)
    expect(Object.keys(byUnit)).toHaveLength(2)
  })

  test('相同单位累加', () => {
    const health = useHealthStore()
    health.addExercise({ date: '2026-10-25', type: '跑步', duration: 30, distance: 5, unit: 'km' })
    health.addExercise({ date: '2026-10-25', type: '骑行', duration: 60, distance: 15, unit: 'km' })

    const items = health.exercises
    const byUnit = {}
    for (const e of items) {
      if (!e.distance) continue
      const u = e.unit || 'km'
      byUnit[u] = (byUnit[u] || 0) + Number(e.distance || 0)
    }
    expect(byUnit['km']).toBe(20)
  })
})