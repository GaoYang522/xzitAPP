import { describe, test, expect } from 'vitest'
import {
  buildGradeTrendOption,
  buildGpaTrendOption,
  buildExerciseStatsOption,
  buildMoodTrendOption,
  buildPomodoroStatsOption,
} from '../src/utils/chartOptions.js'

describe('buildGradeTrendOption', () => {
  test('生成成绩趋势图option', () => {
    const grades = [
      { subject: '高数', score: 90 },
      { subject: '英语', score: 85 },
      { subject: '物理', score: 78 },
    ]
    const option = buildGradeTrendOption(grades)
    expect(option.xAxis.data).toEqual(['高数', '英语', '物理'])
    expect(option.series[0].data).toEqual([90, 85, 78])
    expect(option.series[0].type).toBe('line')
  })

  test('空数据显示提示', () => {
    const option = buildGradeTrendOption([])
    expect(option.title.text).toContain('暂无')
  })
})

describe('buildGpaTrendOption', () => {
  test('生成GPA柱状图option', () => {
    const gpaList = [
      { semester: '大一上', gpa: 3.5 },
      { semester: '大一下', gpa: 3.8 },
    ]
    const option = buildGpaTrendOption(gpaList)
    expect(option.xAxis.data).toEqual(['大一上', '大一下'])
    expect(option.series[0].data).toEqual([3.5, 3.8])
    expect(option.series[0].type).toBe('bar')
  })

  test('空数据显示提示', () => {
    const option = buildGpaTrendOption([])
    expect(option.title.text).toContain('暂无')
  })
})

describe('buildExerciseStatsOption', () => {
  test('生成运动统计柱状图', () => {
    const exercises = [
      { date: '2026-10-20', duration: 30 },
      { date: '2026-10-21', duration: 45 },
      { date: '2026-10-22', duration: 60 },
    ]
    const option = buildExerciseStatsOption(exercises)
    expect(option.series[0].type).toBe('bar')
    expect(option.series[0].data).toEqual([30, 45, 60])
  })

  test('空数据显示提示', () => {
    const option = buildExerciseStatsOption([])
    expect(option.title.text).toContain('暂无')
  })
})

describe('buildMoodTrendOption', () => {
  test('生成心情趋势折线图', () => {
    const moods = [
      { date: '2026-10-20', mood: '😊' },
      { date: '2026-10-21', mood: '😐' },
      { date: '2026-10-22', mood: '🙂' },
    ]
    const option = buildMoodTrendOption(moods)
    expect(option.series[0].type).toBe('line')
    expect(option.series[0].data).toEqual([5, 3, 4])
  })

  test('空数据显示提示', () => {
    const option = buildMoodTrendOption([])
    expect(option.title.text).toContain('暂无')
  })
})

describe('buildPomodoroStatsOption', () => {
  test('生成番茄钟统计柱状图', () => {
    const sessions = [
      { type: 'focus', duration: 25, completedAt: '2026-10-20T10:00:00Z' },
      { type: 'focus', duration: 25, completedAt: '2026-10-20T11:00:00Z' },
      { type: 'focus', duration: 30, completedAt: '2026-10-21T10:00:00Z' },
      { type: 'break', duration: 5, completedAt: '2026-10-20T10:30:00Z' },
    ]
    const option = buildPomodoroStatsOption(sessions)
    expect(option.series[0].type).toBe('bar')
    expect(option.xAxis.data).toContain('10-20')
    expect(option.xAxis.data).toContain('10-21')
    expect(option.series[0].data).toContain(50)
    expect(option.series[0].data).toContain(30)
  })

  test('空数据显示提示', () => {
    const option = buildPomodoroStatsOption([])
    expect(option.title.text).toContain('暂无')
  })
})