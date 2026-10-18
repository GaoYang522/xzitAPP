import { formatDate, today, daysBetween, isSameDay, getWeekday } from '../src/composables/useDate'

describe('useDate 日期工具', () => {
  test('formatDate 格式化日期', () => {
    expect(formatDate('2026-10-16')).toBe('2026-10-16')
    expect(formatDate(new Date(2026, 9, 16))).toBe('2026-10-16')
    expect(formatDate('')).toBe('')
    expect(formatDate('invalid')).toBe('')
  })

  test('today 返回今天日期格式', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('daysBetween 计算天数差', () => {
    expect(daysBetween('2026-10-01', '2026-10-16')).toBe(15)
    expect(daysBetween('2026-10-16', '2026-10-01')).toBe(-15)
    expect(daysBetween('2026-10-16', '2026-10-16')).toBe(0)
  })

  test('isSameDay 判断同一天', () => {
    expect(isSameDay('2026-10-16', '2026-10-16')).toBe(true)
    expect(isSameDay('2026-10-16', '2026-10-17')).toBe(false)
  })

  test('getWeekday 返回星期几（1-7，周日为7）', () => {
    expect(getWeekday('2026-10-16')).toBe(5)
    expect(getWeekday('2026-10-18')).toBe(7)
    expect(getWeekday('2026-10-12')).toBe(1)
  })
})