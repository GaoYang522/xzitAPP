import { SECTION_TIMES, getSectionTime } from '../src/utils/sectionTime'

describe('sectionTime 时间段映射', () => {
  test('第1节为08:00-08:45', () => {
    expect(getSectionTime(1)).toBe('08:00-08:45')
  })

  test('第5节为14:00-14:45（下午第一节）', () => {
    expect(getSectionTime(5)).toBe('14:00-14:45')
  })

  test('第9节为19:00-19:45（晚上第一节）', () => {
    expect(getSectionTime(9)).toBe('19:00-19:45')
  })

  test('第14节有时间段', () => {
    expect(getSectionTime(14)).not.toBe('')
  })

  test('无效节次返回空字符串', () => {
    expect(getSectionTime(0)).toBe('')
    expect(getSectionTime(15)).toBe('')
    expect(getSectionTime(-1)).toBe('')
  })

  test('SECTION_TIMES 共15个条目（index 0 为 null，1-14 有值）', () => {
    expect(SECTION_TIMES.length).toBe(15)
    expect(SECTION_TIMES[0]).toBeNull()
    for (let i = 1; i <= 14; i++) {
      expect(SECTION_TIMES[i]).toBeTruthy()
      expect(SECTION_TIMES[i].start).toMatch(/^\d{2}:\d{2}$/)
      expect(SECTION_TIMES[i].end).toMatch(/^\d{2}:\d{2}$/)
    }
  })
})