import { describe, test, expect } from 'vitest'
import {
  getDayOfWeek,
  getCurrentWeek,
  getTodayCourses,
  formatCourseList,
  formatTodoList,
  formatExamList,
  formatHomeworkList,
  formatGradeList,
  buildAppDataSummary,
} from '../src/utils/appDataContext.js'

describe('getDayOfWeek', () => {
  test('周一返回1', () => {
    expect(getDayOfWeek(new Date('2026-10-19'))).toBe(1)
  })
  test('周三返回3', () => {
    expect(getDayOfWeek(new Date('2026-10-21'))).toBe(3)
  })
  test('周日返回7', () => {
    expect(getDayOfWeek(new Date('2026-10-25'))).toBe(7)
  })
})

describe('getCurrentWeek', () => {
  test('正确计算当前周次', () => {
    expect(getCurrentWeek('2026-09-01', new Date('2026-10-19'))).toBe(7)
  })
  test('学期开始前返回null', () => {
    expect(getCurrentWeek('2026-12-01', new Date('2026-10-19'))).toBeNull()
  })
  test('空学期开始返回null', () => {
    expect(getCurrentWeek('', new Date())).toBeNull()
  })
  test('无效日期返回null', () => {
    expect(getCurrentWeek('invalid', new Date())).toBeNull()
  })
})

describe('getTodayCourses', () => {
  const courses = [
    { name: '高数', day: 1, startSection: 1, endSection: 2, location: '教1', startWeek: 1, endWeek: 16 },
    { name: '英语', day: 3, startSection: 3, endSection: 4, location: '教2', startWeek: 1, endWeek: 20 },
    { name: '物理', day: 3, startSection: 5, endSection: 6, location: '教3', startWeek: 1, endWeek: 10 },
  ]

  test('返回今天的课程', () => {
    const result = getTodayCourses(courses, new Date('2026-10-21'), '2026-09-01', 20)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('英语')
    expect(result[1].name).toBe('物理')
  })

  test('按周次过滤课程', () => {
    const result = getTodayCourses(courses, new Date('2026-12-02'), '2026-09-01', 20)
    // 2026-12-02 是周三，第14周，物理只到第10周
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('英语')
  })

  test('无课返回空数组', () => {
    const result = getTodayCourses(courses, new Date('2026-10-20'), '2026-09-01', 20)
    expect(result).toHaveLength(0)
  })
})

describe('formatCourseList', () => {
  test('格式化课程列表', () => {
    const courses = [
      { name: '高数', startSection: 1, endSection: 2, location: '教1', teacher: '张老师' },
    ]
    const result = formatCourseList(courses)
    expect(result).toContain('高数')
    expect(result).toContain('第1-2节')
    expect(result).toContain('教1')
    expect(result).toContain('张老师')
  })
  test('空列表返回提示', () => {
    expect(formatCourseList([])).toBe('今天没有课')
  })
})

describe('formatTodoList', () => {
  test('格式化未完成待办', () => {
    const todos = [
      { title: '买书', done: false, priority: 'high', dueDate: '2026-10-22' },
      { title: '跑步', done: false },
      { title: '已完成', done: true },
    ]
    const result = formatTodoList(todos)
    expect(result).toContain('买书')
    expect(result).toContain('跑步')
    expect(result).not.toContain('已完成')
  })
  test('全部完成返回提示', () => {
    expect(formatTodoList([{ title: 'x', done: true }])).toBe('没有待完成的待办')
  })
})

describe('formatExamList', () => {
  test('返回即将到来的考试', () => {
    const exams = [
      { name: '高数期中', date: '2026-11-15' },
      { name: '已过考试', date: '2026-01-01' },
    ]
    const result = formatExamList(exams, new Date('2026-10-21'))
    expect(result).toContain('高数期中')
    expect(result).not.toContain('已过考试')
  })
  test('无考试返回提示', () => {
    expect(formatExamList([], new Date())).toBe('没有即将到来的考试')
  })
})

describe('formatHomeworkList', () => {
  test('返回未完成作业', () => {
    const homework = [
      { subject: '高数', content: '习题1', done: false, dueDate: '2026-10-22' },
      { subject: '英语', content: '作文', done: true },
    ]
    const result = formatHomeworkList(homework)
    expect(result).toContain('高数')
    expect(result).toContain('习题1')
    expect(result).not.toContain('英语')
  })
  test('无作业返回提示', () => {
    expect(formatHomeworkList([])).toBe('没有待完成的作业')
  })
})

describe('formatGradeList', () => {
  test('格式化成绩列表', () => {
    const grades = [
      { subject: '高数', score: 90 },
      { subject: '英语', score: 85 },
    ]
    const result = formatGradeList(grades)
    expect(result).toContain('高数')
    expect(result).toContain('90')
    expect(result).toContain('英语')
    expect(result).toContain('85')
  })
  test('无成绩返回提示', () => {
    expect(formatGradeList([])).toBe('暂无成绩记录')
  })
})

describe('buildAppDataSummary', () => {
  test('生成完整数据摘要', () => {
    const stores = {
      study: {
        courses: [{ name: '高数', day: 1, startSection: 1, endSection: 2, location: '教1', startWeek: 1, endWeek: 16 }],
        homework: [],
        exams: [],
        grades: [{ subject: '高数', score: 90 }],
      },
      tools: {
        todos: [{ title: '买书', done: false, priority: 'high' }],
        notes: [],
        countdowns: [],
        habits: [],
      },
      life: { cardBalance: 100, cardRecords: [], canteen: [], places: [], packages: [] },
      club: { clubs: [], activities: [], posts: [] },
      health: { checkins: [], fitness: [], exercises: [], moods: [] },
      settings: { theme: 'light', semesterStart: '2026-09-01', totalWeeks: 20 },
    }
    const result = buildAppDataSummary(stores)
    expect(result).toContain('当前应用数据摘要')
    expect(result).toContain('今日课程')
    expect(result).toContain('待办事项')
    expect(result).toContain('买书')
    expect(result).toContain('成绩记录')
    expect(result).toContain('90')
    expect(result).toContain('一卡通余额')
    expect(result).toContain('100')
  })
})