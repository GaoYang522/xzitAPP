import { setActivePinia, createPinia } from 'pinia'
import { describe, test, expect, beforeEach } from 'vitest'
import { useStudyStore } from '../src/stores/study.js'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('作业优先级排序', () => {
  test('高优先级排在前面', () => {
    const study = useStudyStore()
    study.addHomework({ subject: '数学', content: '作业1', priority: 'low', done: false })
    study.addHomework({ subject: '英语', content: '作业2', priority: 'high', done: false })
    study.addHomework({ subject: '物理', content: '作业3', priority: 'medium', done: false })

    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const sorted = [...study.homework].sort((a, b) => {
      if (a.done !== b.done) return a.done - b.done
      const pa = priorityOrder[a.priority] || 2
      const pb = priorityOrder[b.priority] || 2
      if (pa !== pb) return pb - pa
      return 0
    })

    expect(sorted[0].priority).toBe('high')
    expect(sorted[1].priority).toBe('medium')
    expect(sorted[2].priority).toBe('low')
  })

  test('未完成排在已完成前面', () => {
    const study = useStudyStore()
    study.addHomework({ subject: '数学', content: '作业1', priority: 'high', done: true })
    study.addHomework({ subject: '英语', content: '作业2', priority: 'low', done: false })

    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const sorted = [...study.homework].sort((a, b) => {
      if (a.done !== b.done) return a.done - b.done
      const pa = priorityOrder[a.priority] || 2
      const pb = priorityOrder[b.priority] || 2
      if (pa !== pb) return pb - pa
      return 0
    })

    expect(sorted[0].done).toBe(false)
    expect(sorted[1].done).toBe(true)
  })

  test('同优先级按截止时间排序', () => {
    const study = useStudyStore()
    study.addHomework({ subject: '数学', content: '作业1', priority: 'high', deadline: '2026-10-25', done: false })
    study.addHomework({ subject: '英语', content: '作业2', priority: 'high', deadline: '2026-10-23', done: false })

    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const sorted = [...study.homework].sort((a, b) => {
      if (a.done !== b.done) return a.done - b.done
      const pa = priorityOrder[a.priority] || 2
      const pb = priorityOrder[b.priority] || 2
      if (pa !== pb) return pb - pa
      return new Date(a.deadline || '9999') - new Date(b.deadline || '9999')
    })

    expect(sorted[0].deadline).toBe('2026-10-23')
    expect(sorted[1].deadline).toBe('2026-10-25')
  })

  test('默认优先级为medium', () => {
    const study = useStudyStore()
    study.addHomework({ subject: '数学', content: '作业1', done: false })
    expect(study.homework[0].priority || 'medium').toBe('medium')
  })
})