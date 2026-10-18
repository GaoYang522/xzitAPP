import { getCurrentWeek, isCourseInWeek } from '../src/composables/useWeek'

describe('useWeek 周次计算', () => {
  test('getCurrentWeek 计算当前周次（14天前=第3周）', () => {
    const start = new Date()
    start.setDate(start.getDate() - 14)
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
    expect(getCurrentWeek(startStr, 20)).toBe(3)
  })

  test('getCurrentWeek 学期未开始返回 null', () => {
    const future = new Date()
    future.setDate(future.getDate() + 7)
    const futureStr = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`
    expect(getCurrentWeek(futureStr, 20)).toBeNull()
  })

  test('getCurrentWeek 超出总周数返回 null', () => {
    const past = new Date()
    past.setDate(past.getDate() - 200)
    const pastStr = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`
    expect(getCurrentWeek(pastStr, 20)).toBeNull()
  })

  test('getCurrentWeek 无开始日期返回 null', () => {
    expect(getCurrentWeek('', 20)).toBeNull()
  })

  test('isCourseInWeek 判断课程在当前周', () => {
    expect(isCourseInWeek({ startWeek: 1, endWeek: 16 }, 5)).toBe(true)
    expect(isCourseInWeek({ startWeek: 1, endWeek: 16 }, 17)).toBe(false)
    expect(isCourseInWeek({ startWeek: 1, endWeek: 16 }, null)).toBe(false)
  })
})