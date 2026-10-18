import {
  normalizeItems,
  detectDayColumns,
  detectSectionRows,
  collectCellItems,
  parseWeeks,
  parseSections,
  parseCellContent,
  groupLines,
  parseScheduleFromTextItems,
} from '../src/utils/pdfScheduleParser'

function makeRawItem(str, x, y) {
  return { str, transform: [1, 0, 0, 1, x, y], width: 10, height: 10 }
}

describe('pdfScheduleParser', () => {
  describe('normalizeItems', () => {
    test('将 raw items 转为 {str,x,y} 且 y 从顶部算起', () => {
      const raw = [makeRawItem('A', 100, 50), makeRawItem('B', 200, 30)]
      const items = normalizeItems(raw, 300)
      expect(items).toHaveLength(2)
      expect(items[0]).toEqual({ str: 'A', x: 100, y: 250 })
      expect(items[1]).toEqual({ str: 'B', x: 200, y: 270 })
    })

    test('过滤空字符串', () => {
      const raw = [makeRawItem('A', 0, 0), makeRawItem('   ', 0, 0)]
      const items = normalizeItems(raw, 100)
      expect(items).toHaveLength(1)
    })
  })

  describe('detectDayColumns', () => {
    test('找到周一到周日表头时按实际坐标分列', () => {
      const items = [
        { str: '周一', x: 100, y: 10 }, { str: '周二', x: 200, y: 10 },
        { str: '周三', x: 300, y: 10 }, { str: '周四', x: 400, y: 10 },
        { str: '周五', x: 500, y: 10 }, { str: '周六', x: 600, y: 10 },
        { str: '周日', x: 700, y: 10 },
      ]
      const cols = detectDayColumns(items, 800)
      expect(cols[1].center).toBe(100)
      expect(cols[7].center).toBe(700)
      expect(cols[1].left).toBe(0)
      expect(cols[7].right).toBe(800)
    })

    test('未找到表头时均匀分 7 列', () => {
      const items = [{ str: '课表', x: 50, y: 10 }]
      const cols = detectDayColumns(items, 800)
      expect(cols[1]).toBeDefined()
      expect(cols[7]).toBeDefined()
      expect(cols[1].center).toBeLessThan(cols[2].center)
    })
  })

  describe('detectSectionRows', () => {
    test('找到第1节到第12节时按实际坐标分行', () => {
      const items = []
      for (let n = 1; n <= 12; n++) {
        items.push({ str: `第${n}节`, x: 10, y: n * 50 })
      }
      const rows = detectSectionRows(items, 700)
      expect(rows[1].center).toBe(50)
      expect(rows[12].center).toBe(600)
      expect(rows[1].top).toBe(0)
      expect(rows[12].bottom).toBe(700)
    })

    test('未找到节次时均匀分 12 行', () => {
      const items = [{ str: '课表', x: 10, y: 10 }]
      const rows = detectSectionRows(items, 600)
      expect(rows[1]).toBeDefined()
      expect(rows[12]).toBeDefined()
      expect(rows[1].center).toBeLessThan(rows[2].center)
    })
  })

  describe('collectCellItems', () => {
    test('只收集落在指定范围内的项', () => {
      const items = [
        { str: 'A', x: 150, y: 60 }, { str: 'B', x: 50, y: 60 }, { str: 'C', x: 150, y: 200 },
      ]
      const col = { left: 100, right: 200, center: 150 }
      const row = { top: 50, bottom: 100, center: 75 }
      const result = collectCellItems(items, col, row)
      expect(result).toHaveLength(1)
      expect(result[0].str).toBe('A')
    })
  })

  describe('parseWeeks', () => {
    test('解析 1-16周 格式', () => {
      expect(parseWeeks('1-16周')).toEqual({ startWeek: 1, endWeek: 16 })
    })
    test('解析 1—16周 格式（破折号）', () => {
      expect(parseWeeks('1—16周')).toEqual({ startWeek: 1, endWeek: 16 })
    })
    test('解析单周 3周', () => {
      expect(parseWeeks('3周')).toEqual({ startWeek: 3, endWeek: 3 })
    })
    test('无周次信息返回 null', () => {
      expect(parseWeeks('高等数学')).toBeNull()
    })
  })

  describe('parseSections', () => {
    test('解析 1-2节', () => {
      expect(parseSections('1-2节')).toEqual({ startSection: 1, endSection: 2 })
    })
    test('解析单节 3节', () => {
      expect(parseSections('3节')).toEqual({ startSection: 3, endSection: 3 })
    })
    test('无节次信息返回 null', () => {
      expect(parseSections('高等数学')).toBeNull()
    })
  })

  describe('parseCellContent', () => {
    test('从多行文本提取课程名、场地、教师、周次', () => {
      const lines = ['高等数学', '1-16周', '教1-101', '张老师']
      const result = parseCellContent(lines)
      expect(result.name).toBe('高等数学')
      expect(result.location).toBe('教1-101')
      expect(result.teacher).toBe('张老师')
      expect(result.startWeek).toBe(1)
      expect(result.endWeek).toBe(16)
    })

    test('空行返回 null', () => {
      expect(parseCellContent([])).toBeNull()
      expect(parseCellContent(['', '  '])).toBeNull()
    })

    test('只有课程名也能解析', () => {
      const result = parseCellContent(['大学英语'])
      expect(result.name).toBe('大学英语')
      expect(result.startWeek).toBe(1)
      expect(result.endWeek).toBe(16)
    })
  })

  describe('groupLines', () => {
    test('y 接近的项归为同一行，按 x 排序拼接', () => {
      const items = [
        { str: 'B', x: 200, y: 50 }, { str: 'A', x: 100, y: 52 }, { str: 'C', x: 100, y: 80 },
      ]
      const lines = groupLines(items, 5)
      expect(lines).toEqual(['AB', 'C'])
    })
    test('空数组返回空', () => {
      expect(groupLines([])).toEqual([])
    })
  })

  describe('parseScheduleFromTextItems', () => {
    test('完整课表解析：含跨节课程', () => {
      const pageWidth = 800
      const pageHeight = 700
      const rawItems = [
        makeRawItem('周一', 100, 690), makeRawItem('周二', 200, 690),
        makeRawItem('周三', 300, 690), makeRawItem('周四', 400, 690),
        makeRawItem('周五', 500, 690), makeRawItem('周六', 600, 690),
        makeRawItem('周日', 700, 690),
        makeRawItem('第1节', 10, 650), makeRawItem('第2节', 10, 600),
        makeRawItem('第3节', 10, 550), makeRawItem('第4节', 10, 500),
        makeRawItem('第5节', 10, 450), makeRawItem('第6节', 10, 400),
        makeRawItem('第7节', 10, 350), makeRawItem('第8节', 10, 300),
        makeRawItem('第9节', 10, 250), makeRawItem('第10节', 10, 200),
        makeRawItem('第11节', 10, 150), makeRawItem('第12节', 10, 100),
        makeRawItem('高等数学', 100, 650), makeRawItem('1-16周', 100, 635),
        makeRawItem('教1-101', 100, 620), makeRawItem('张老师', 100, 605),
        makeRawItem('大学英语', 200, 560), makeRawItem('1-8周', 200, 550),
        makeRawItem('教2-201', 200, 540),
      ]
      const items = normalizeItems(rawItems, pageHeight)
      const courses = parseScheduleFromTextItems(items, pageWidth, pageHeight)

      const math = courses.find((c) => c.name === '高等数学')
      expect(math).toBeTruthy()
      expect(math.day).toBe(1)
      expect(math.startSection).toBe(1)
      expect(math.endSection).toBe(2)
      expect(math.startWeek).toBe(1)
      expect(math.endWeek).toBe(16)
      expect(math.location).toBe('教1-101')

      const english = courses.find((c) => c.name === '大学英语')
      expect(english).toBeTruthy()
      expect(english.day).toBe(2)
      expect(english.startSection).toBe(3)
      expect(english.endSection).toBe(3)
    })

    test('空内容返回空数组', () => {
      const courses = parseScheduleFromTextItems([], 800, 700)
      expect(courses).toEqual([])
    })

    test('每个课程自动分配颜色', () => {
      const rawItems = [
        makeRawItem('周一', 100, 690), makeRawItem('周二', 200, 690),
        makeRawItem('周三', 300, 690), makeRawItem('周四', 400, 690),
        makeRawItem('周五', 500, 690), makeRawItem('周六', 600, 690),
        makeRawItem('周日', 700, 690),
        ...Array.from({ length: 12 }, (_, i) => makeRawItem(`第${i + 1}节`, 10, 650 - i * 50)),
        makeRawItem('课程A', 100, 640),
        makeRawItem('课程B', 200, 640),
      ]
      const items = normalizeItems(rawItems, 700)
      const courses = parseScheduleFromTextItems(items, 800, 700)
      expect(courses.length).toBeGreaterThanOrEqual(2)
      const validColors = ['blue', 'purple', 'orange', 'green', 'pink', 'cyan']
      courses.forEach((c) => {
        expect(validColors).toContain(c.color)
      })
    })
  })
})