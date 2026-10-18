import {
  normalizeItems,
  detectOrientation,
  detectDayBounds,
  findSectionLabels,
  detectSectionBounds,
  isTimeOrHeader,
  parseWeeks,
  parseSections,
  parseCellContent,
  groupLines,
  parseScheduleFromTextItems,
  extractSectionTimes,
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

  describe('detectOrientation', () => {
    test('星期按x排列时返回vertical', () => {
      const items = [
        { str: '周一', x: 100, y: 10 }, { str: '周二', x: 200, y: 10 },
        { str: '周三', x: 300, y: 10 },
      ]
      expect(detectOrientation(items)).toBe('vertical')
    })
    test('星期按y排列时返回horizontal', () => {
      const items = [
        { str: '星期一', x: 74, y: 462 }, { str: '星期二', x: 74, y: 358 },
        { str: '星期三', x: 74, y: 254 },
      ]
      expect(detectOrientation(items)).toBe('horizontal')
    })
    test('少于2个星期标签默认vertical', () => {
      expect(detectOrientation([{ str: '课表', x: 50, y: 10 }])).toBe('vertical')
    })
  })

  describe('detectDayBounds', () => {
    test('纵向课表按x坐标分列', () => {
      const items = [
        { str: '周一', x: 100, y: 10 }, { str: '周二', x: 200, y: 10 },
        { str: '周三', x: 300, y: 10 }, { str: '周四', x: 400, y: 10 },
        { str: '周五', x: 500, y: 10 }, { str: '周六', x: 600, y: 10 },
        { str: '周日', x: 700, y: 10 },
      ]
      const bounds = detectDayBounds(items, 800, 600, 'vertical')
      expect(bounds[1].center).toBe(100)
      expect(bounds[7].center).toBe(700)
    })
    test('横向课表按y坐标分行', () => {
      const items = [
        { str: '星期一', x: 74, y: 462 }, { str: '星期二', x: 74, y: 358 },
        { str: '星期三', x: 74, y: 254 }, { str: '星期四', x: 74, y: 150 },
        { str: '星期五', x: 74, y: 46 }, { str: '星期六', x: 74, y: -57 },
        { str: '星期日', x: 74, y: -161 },
      ]
      const bounds = detectDayBounds(items, 842, 595, 'horizontal')
      expect(bounds[1].center).toBe(462)
      expect(bounds[2].center).toBe(358)
    })
  })

  describe('findSectionLabels', () => {
    test('匹配第N节格式', () => {
      const items = [{ str: '第1节', x: 10, y: 50 }, { str: '第2节', x: 10, y: 100 }]
      const labels = findSectionLabels(items)
      expect(labels).toHaveLength(2)
      expect(labels[0].n).toBe(1)
    })
    test('匹配纯数字1-12', () => {
      const items = [
        { str: '1', x: 89, y: 517 }, { str: '2', x: 140, y: 517 },
        { str: '3', x: 190, y: 517 },
      ]
      const labels = findSectionLabels(items)
      expect(labels).toHaveLength(3)
      expect(labels[0].n).toBe(1)
    })
  })

  describe('detectSectionBounds', () => {
    test('纵向课表按y坐标分行', () => {
      const items = []
      for (let n = 1; n <= 12; n++) items.push({ str: `第${n}节`, x: 10, y: n * 50 })
      const bounds = detectSectionBounds(items, 800, 700, 'vertical')
      expect(bounds[1].center).toBe(50)
      expect(bounds[12].center).toBe(600)
    })
    test('横向课表按x坐标分列', () => {
      const items = []
      for (let n = 1; n <= 12; n++) items.push({ str: String(n), x: n * 50, y: 517 })
      const bounds = detectSectionBounds(items, 842, 595, 'horizontal')
      expect(bounds[1].center).toBe(50)
      expect(bounds[12].center).toBe(600)
    })
  })

  describe('isTimeOrHeader', () => {
    test('识别时间', () => expect(isTimeOrHeader('08:00')).toBe(true))
    test('识别表头', () => expect(isTimeOrHeader('上午')).toBe(true))
    test('识别实验时段', () => expect(isTimeOrHeader('实验时段1')).toBe(true))
    test('识别学号', () => expect(isTimeOrHeader('学号：25100200113')).toBe(true))
    test('非表头返回false', () => expect(isTimeOrHeader('高等数学')).toBe(false))
    test('冒号开头的教师名不是表头', () => expect(isTimeOrHeader(':赵文婧')).toBe(false))
    test('纯冒号是表头', () => expect(isTimeOrHeader(':')).toBe(true))
    test('实践课程说明是表头', () => expect(isTimeOrHeader('实践课程：电子工艺实习张艳华(共1周)/第17周;')).toBe(true))
    test('其他课程说明是表头', () => expect(isTimeOrHeader('其他课程：中国近现代史纲要张翔兮(共4周)/1-4周/无;')).toBe(true))
  })

  describe('parseWeeks', () => {
    test('解析 1-16周', () => expect(parseWeeks('1-16周')).toEqual({ startWeek: 1, endWeek: 16 }))
    test('解析单周', () => expect(parseWeeks('3周')).toEqual({ startWeek: 3, endWeek: 3 }))
    test('无周次返回null', () => expect(parseWeeks('高等数学')).toBeNull())
  })

  describe('parseSections', () => {
    test('解析(1-2节)带括号格式', () => {
      expect(parseSections('(1-2节)1-16周')).toEqual({ startSection: 1, endSection: 2 })
    })
    test('解析1-2节无括号格式', () => {
      expect(parseSections('1-2节')).toEqual({ startSection: 1, endSection: 2 })
    })
    test('无节次返回null', () => expect(parseSections('高等数学')).toBeNull())
  })

  describe('parseCellContent', () => {
    test('解析新格式：课程名(节次)周次/场地:xxx/教师:xxx', () => {
      const text = '高等数学A(Ⅱ)(1-2节)1-16周/校区:中心校区/场地:敬本C501/教师:胡江'
      const result = parseCellContent([text])
      expect(result.name).toBe('高等数学A(Ⅱ)')
      expect(result.location).toBe('敬本C501')
      expect(result.teacher).toBe('胡江')
      expect(result.startWeek).toBe(1)
      expect(result.endWeek).toBe(16)
      expect(result.startSection).toBe(1)
      expect(result.endSection).toBe(2)
    })

    test('解析旧格式：多行文本', () => {
      const lines = ['高等数学', '1-16周', '教1-101', '张老师']
      const result = parseCellContent(lines)
      expect(result.name).toBe('高等数学')
      expect(result.location).toBe('教1-101')
      expect(result.teacher).toBe('张老师')
    })

    test('空行返回null', () => {
      expect(parseCellContent([])).toBeNull()
      expect(parseCellContent(['', '  '])).toBeNull()
    })

    test('含"教育"的课程名不被误设为location', () => {
      const lines = ['大学生心理健康教育', '1-16周']
      const result = parseCellContent(lines)
      expect(result.name).toBe('大学生心理健康教育')
      expect(result.location).toBe('')
    })

    test('旧格式教1-101仍能识别为location', () => {
      const lines = ['高等数学', '1-16周', '教1-101']
      const result = parseCellContent(lines)
      expect(result.location).toBe('教1-101')
    })
  })

  describe('groupLines', () => {
    test('y接近的项归为同一行', () => {
      const items = [
        { str: 'B', x: 200, y: 50 }, { str: 'A', x: 100, y: 52 }, { str: 'C', x: 100, y: 80 },
      ]
      expect(groupLines(items, 5)).toEqual(['AB', 'C'])
    })
    test('空数组返回空', () => expect(groupLines([])).toEqual([]))
  })

  describe('parseScheduleFromTextItems - 纵向课表', () => {
    test('完整课表解析：含跨节课程', () => {
      const pageWidth = 800
      const pageHeight = 700
      const rawItems = [
        makeRawItem('周一', 100, 690), makeRawItem('周二', 200, 690),
        makeRawItem('周三', 300, 690), makeRawItem('周四', 400, 690),
        makeRawItem('周五', 500, 690), makeRawItem('周六', 600, 690),
        makeRawItem('周日', 700, 690),
        ...Array.from({ length: 12 }, (_, i) => makeRawItem(`第${i + 1}节`, 10, 650 - i * 50)),
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

      const english = courses.find((c) => c.name === '大学英语')
      expect(english).toBeTruthy()
      expect(english.day).toBe(2)
      expect(english.startSection).toBe(3)
      expect(english.endSection).toBe(3)
    })

    test('空内容返回空数组', () => {
      expect(parseScheduleFromTextItems([], 800, 700)).toEqual([])
    })
  })

  describe('parseScheduleFromTextItems - 横向课表', () => {
    test('解析横向课表（星期按y排列，节次按x排列）', () => {
      const pageWidth = 842
      const pageHeight = 595
      const rawItems = [
        makeRawItem('星期一', 74, 133), makeRawItem('星期二', 74, 237),
        makeRawItem('星期三', 74, 341), makeRawItem('星期四', 74, 445),
        makeRawItem('星期五', 74, 548), makeRawItem('星期六', 74, 652),
        makeRawItem('星期日', 74, 756),
        makeRawItem('1', 89, 78), makeRawItem('2', 140, 78),
        makeRawItem('3', 190, 78), makeRawItem('4', 247, 78),
        makeRawItem('5', 303, 78), makeRawItem('6', 342, 78),
        makeRawItem('7', 381, 78), makeRawItem('8', 420, 78),
        makeRawItem('9', 459, 78), makeRawItem('10', 498, 78),
        makeRawItem('11', 537, 78), makeRawItem('12', 576, 78),
        makeRawItem('高等数学A(Ⅱ)(1-2节)1-16周/场地:敬本C501/教师:胡江', 89, 104),
        makeRawItem('MATLAB程序设计(3-4节)1-12周/场地:敬业F407/教师:张艳华', 190, 104),
        makeRawItem('电路(7-8节)1-14周/场地:敬业F406/教师:赵文婧', 381, 104),
        makeRawItem('线性代数A(1-2节)1-8周/场地:敬业F410/教师:卞利花', 89, 208),
      ]
      const items = normalizeItems(rawItems, pageHeight)
      const courses = parseScheduleFromTextItems(items, pageWidth, pageHeight)

      const math = courses.find((c) => c.name === '高等数学A(Ⅱ)')
      expect(math).toBeTruthy()
      expect(math.day).toBe(1)
      expect(math.startSection).toBe(1)
      expect(math.endSection).toBe(2)
      expect(math.location).toBe('敬本C501')
      expect(math.teacher).toBe('胡江')

      const matlab = courses.find((c) => c.name === 'MATLAB程序设计')
      expect(matlab).toBeTruthy()
      expect(matlab.day).toBe(1)
      expect(matlab.startSection).toBe(3)
      expect(matlab.endSection).toBe(4)

      const circuit = courses.find((c) => c.name === '电路')
      expect(circuit).toBeTruthy()
      expect(circuit.day).toBe(1)
      expect(circuit.startSection).toBe(7)
      expect(circuit.endSection).toBe(8)

      const linear = courses.find((c) => c.name === '线性代数A')
      expect(linear).toBeTruthy()
      expect(linear.day).toBe(2)
      expect(linear.startSection).toBe(1)
      expect(linear.endSection).toBe(2)
    })
  })

  describe('多页解析与节次13-14支持', () => {
    test('findSectionLabels 支持纯数字13、14', () => {
      const raw = [
        makeRawItem('13', 56, 520), makeRawItem('14', 95, 520),
      ]
      const items = normalizeItems(raw, 600)
      const labels = findSectionLabels(items)
      const nums = labels.map((l) => l.n).sort((a, b) => a - b)
      expect(nums).toContain(13)
      expect(nums).toContain(14)
    })

    test('detectSectionBounds 返回15个元素（index 0 为 null，1-14 有值）', () => {
      const raw = []
      for (let n = 1; n <= 12; n++) raw.push(makeRawItem(String(n), 50 + n * 50, 520))
      const items = normalizeItems(raw, 600)
      const bounds = detectSectionBounds(items, 800, 600, 'horizontal')
      expect(bounds.length).toBe(15)
      expect(bounds[0]).toBeNull()
      for (let n = 1; n <= 14; n++) {
        expect(bounds[n]).toBeTruthy()
        expect(bounds[n].center).toBeDefined()
      }
    })

    test('detectSectionBounds 部分标签时1-12精确、13-14外推', () => {
      const raw = []
      for (let n = 1; n <= 12; n++) raw.push(makeRawItem(String(n), 50 + n * 50, 520))
      const items = normalizeItems(raw, 600)
      const bounds = detectSectionBounds(items, 800, 600, 'horizontal')
      expect(bounds[12].center).toBeCloseTo(50 + 12 * 50, 0)
      expect(bounds[13].center).toBeGreaterThan(bounds[12].center)
      expect(bounds[14].center).toBeGreaterThan(bounds[13].center)
    })

    test('parseScheduleFromTextItems 接受预设边界 options', () => {
      const raw = [
        makeRawItem('星期一', 50, 460), makeRawItem('星期二', 50, 360),
        makeRawItem('1', 89, 520), makeRawItem('2', 139, 520),
        makeRawItem('晚课(13-14节)1-16周/场地:教1/教师:张三', 100, 460),
      ]
      const items = normalizeItems(raw, 600)
      const orientation = 'horizontal'
      const dayBounds = detectDayBounds(items, 800, 600, orientation)
      const sectionBounds = detectSectionBounds(items, 800, 600, orientation)
      const courses = parseScheduleFromTextItems(items, 800, 600, { orientation, dayBounds, sectionBounds })
      const late = courses.find((c) => c.name === '晚课')
      expect(late).toBeTruthy()
      expect(late.startSection).toBe(13)
      expect(late.endSection).toBe(14)
    })

    test('parseCellContent 节次信息在开头时返回null', () => {
      expect(parseCellContent(['(12-13节)15周/场地:教1'])).toBeNull()
      expect(parseCellContent(['12-14节9-14周/场地:教1'])).toBeNull()
    })
  })

  describe('extractSectionTimes 时间段提取', () => {
    test('单页11对时间对应节次1-11，12-14为null', () => {
      const times = ['08:00','08:45','08:55','09:40','10:05','10:50','11:00','11:45','12:00','12:45','12:55','13:40','14:00','14:45','14:55','15:40','16:05','16:50','17:00','17:45','17:55','18:35']
      const raw = times.map((t, i) => makeRawItem(t, 100 + i * 20, 526))
      const items = normalizeItems(raw, 600)
      const result = extractSectionTimes([items])
      expect(result[1]).toEqual({ start: '08:00', end: '08:45' })
      expect(result[5]).toEqual({ start: '12:00', end: '12:45' })
      expect(result[11]).toEqual({ start: '17:55', end: '18:35' })
      expect(result[12]).toBeNull()
      expect(result[14]).toBeNull()
    })

    test('两页合并14对时间对应节次1-14', () => {
      const t1 = ['08:00','08:45','08:55','09:40','10:05','10:50','11:00','11:45','12:00','12:45','12:55','13:40','14:00','14:45','14:55','15:40','16:05','16:50','17:00','17:45','17:55','18:35']
      const raw1 = t1.map((t, i) => makeRawItem(t, 100 + i * 20, 526))
      const t2 = ['18:45','19:30','19:40','20:25','20:35','21:20']
      const raw2 = t2.map((t, i) => makeRawItem(t, 30 + i * 20, 526))
      const result = extractSectionTimes([normalizeItems(raw1, 600), normalizeItems(raw2, 600)])
      expect(result[12]).toEqual({ start: '18:45', end: '19:30' })
      expect(result[13]).toEqual({ start: '19:40', end: '20:25' })
      expect(result[14]).toEqual({ start: '20:35', end: '21:20' })
    })

    test('空页返回全null', () => {
      const result = extractSectionTimes([[]])
      expect(result[1]).toBeNull()
      expect(result[14]).toBeNull()
    })
  })

  describe('页面外内容过滤', () => {
    test('y为负的课程文字不被解析（横向课表）', () => {
      const raw = [
        makeRawItem('星期一', 74, 133), makeRawItem('星期二', 74, 237),
        makeRawItem('1', 89, 79), makeRawItem('2', 139, 79),
        makeRawItem('正常课(1-2节)1-16周/场地:教1/教师:张三', 100, 133),
        makeRawItem('溢出课(1-2节)1-16周/场地:教2/教师:李四', 100, 680),
      ]
      const items = normalizeItems(raw, 595)
      const courses = parseScheduleFromTextItems(items, 842, 595)
      const normal = courses.find((c) => c.name === '正常课')
      const overflow = courses.find((c) => c.name === '溢出课')
      expect(normal).toBeTruthy()
      expect(overflow).toBeUndefined()
    })
  })
})