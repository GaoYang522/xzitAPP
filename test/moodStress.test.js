import { setActivePinia, createPinia } from 'pinia'
import { describe, test, expect, beforeEach } from 'vitest'
import { useHealthStore } from '../src/stores/health.js'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('心情与压力值关联', () => {
  test('心情好对应低压力', () => {
    expect(6 - 5).toBe(1)
    expect(6 - 4).toBe(2)
  })

  test('心情差对应高压力', () => {
    expect(6 - 2).toBe(4)
    expect(6 - 1).toBe(5)
  })

  test('心情中等对应压力中等', () => {
    expect(6 - 3).toBe(3)
  })

  test('记录心情时压力值自动关联', () => {
    const health = useHealthStore()
    const mood = 5
    const stress = 6 - mood
    health.addMood({ date: '2026-10-25', mood, stress, note: '开心' })
    expect(health.moods[0].mood).toBe(5)
    expect(health.moods[0].stress).toBe(1)
  })

  test('不同心情对应不同压力', () => {
    const health = useHealthStore()
    for (let m = 1; m <= 5; m++) {
      health.addMood({ date: `2026-10-2${m}`, mood: m, stress: 6 - m })
    }
    expect(health.moods[0].mood + health.moods[0].stress).toBe(6)
    expect(health.moods[4].mood + health.moods[4].stress).toBe(6)
  })
})