// PDF 课表解析工具
// 支持纵向课表（星期按x轴、节次按y轴）和横向课表（星期按y轴、节次按x轴）两种方向
// 核心解析逻辑为纯函数，可在测试中独立验证；parsePdfSchedule 负责读取 PDF 并调用纯函数。

const DAY_PATTERNS = [
  [/星期一|周一/, 1], [/星期二|周二/, 2], [/星期三|周三/, 3],
  [/星期四|周四/, 4], [/星期五|周五/, 5], [/星期六|周六/, 6], [/星期日|周日/, 7],
]

const SECTION_PATTERN = /第\s*(\d+)\s*节/

const COLORS = ['blue', 'purple', 'orange', 'green', 'pink', 'cyan']

// 将 pdfjs TextItem 数组规范化为 { str, x, y } （y 从顶部算起）
export function normalizeItems(rawItems, pageHeight) {
  return rawItems
    .map((item) => ({
      str: item.str || '',
      x: item.transform ? item.transform[4] : 0,
      y: item.transform ? pageHeight - item.transform[5] : 0,
    }))
    .filter((it) => it.str.trim() !== '')
}

// 检测课表方向：'vertical'（星期按x排列）或 'horizontal'（星期按y排列）
export function detectOrientation(items) {
  const dayCoords = []
  for (const it of items) {
    for (const [re] of DAY_PATTERNS) {
      if (re.test(it.str)) {
        dayCoords.push({ x: it.x, y: it.y })
        break
      }
    }
  }
  if (dayCoords.length < 2) return 'vertical'
  const xs = dayCoords.map((c) => c.x)
  const ys = dayCoords.map((c) => c.y)
  const xRange = Math.max(...xs) - Math.min(...xs)
  const yRange = Math.max(...ys) - Math.min(...ys)
  return xRange > yRange ? 'vertical' : 'horizontal'
}

// 检测星期边界：返回长度为 8 的数组，index 1-7，每个为 { min, max, center }
export function detectDayBounds(items, pageWidth, pageHeight, orientation) {
  const found = {}
  for (const it of items) {
    for (const [re, day] of DAY_PATTERNS) {
      if (re.test(it.str) && found[day] === undefined) {
        found[day] = orientation === 'vertical' ? it.x : it.y
        break
      }
    }
  }
  const days = [1, 2, 3, 4, 5, 6, 7]
  const allFound = days.every((d) => found[d] !== undefined)
  const maxRange = orientation === 'vertical' ? pageWidth : pageHeight

  if (!allFound) {
    const step = maxRange / 8
    const result = [null]
    for (let d = 1; d <= 7; d++) {
      result[d] = { center: step * (d + 1), min: step * (d + 0.5), max: step * (d + 1.5) }
    }
    return result
  }

  const coords = days.map((d) => found[d])
  const increasing = coords[6] > coords[0]
  const result = [null]
  for (let i = 0; i < 7; i++) {
    const edge1 = i === 0 ? (increasing ? 0 : maxRange) : (coords[i - 1] + coords[i]) / 2
    const edge2 = i === 6 ? (increasing ? maxRange : 0) : (coords[i + 1] + coords[i]) / 2
    result[days[i]] = { center: coords[i], min: Math.min(edge1, edge2), max: Math.max(edge1, edge2) }
  }
  return result
}

// 查找节次标签：先匹配"第N节"，再匹配纯数字1-12
export function findSectionLabels(items) {
  const patternLabels = []
  for (const it of items) {
    const m = it.str.match(SECTION_PATTERN)
    if (m) {
      const n = parseInt(m[1], 10)
      if (n >= 1 && n <= 12) patternLabels.push({ n, x: it.x, y: it.y })
    }
  }
  if (patternLabels.length >= 2) return patternLabels

  const numItems = []
  for (const it of items) {
    const trimmed = it.str.trim()
    const n = parseInt(trimmed, 10)
    if (trimmed === String(n) && n >= 1 && n <= 12) {
      numItems.push({ n, x: it.x, y: it.y })
    }
  }
  if (numItems.length === 0) return []

  numItems.sort((a, b) => a.y - b.y)
  const groups = []
  let current = [numItems[0]]
  for (let i = 1; i < numItems.length; i++) {
    if (Math.abs(numItems[i].y - current[0].y) <= 10) {
      current.push(numItems[i])
    } else {
      groups.push(current)
      current = [numItems[i]]
    }
  }
  groups.push(current)
  groups.sort((a, b) => new Set(b.map((g) => g.n)).size - new Set(a.map((g) => g.n)).size)
  return groups[0] || []
}

// 检测节次边界：返回长度为 13 的数组，index 1-12，每个为 { min, max, center }
export function detectSectionBounds(items, pageWidth, pageHeight, orientation) {
  const labels = findSectionLabels(items)
  const found = {}
  for (const label of labels) {
    if (found[label.n] === undefined) {
      found[label.n] = orientation === 'vertical' ? label.y : label.x
    }
  }
  const nums = []
  for (let n = 1; n <= 12; n++) nums.push(n)
  const allFound = nums.every((n) => found[n] !== undefined)
  const maxRange = orientation === 'vertical' ? pageHeight : pageWidth

  if (!allFound) {
    const step = maxRange / 13
    const result = [null]
    for (let n = 1; n <= 12; n++) {
      result[n] = { center: step * n, min: step * (n - 0.5), max: step * (n + 0.5) }
    }
    return result
  }

  const coords = nums.map((n) => found[n])
  const increasing = coords[11] > coords[0]
  const result = [null]
  for (let i = 0; i < 12; i++) {
    const edge1 = i === 0 ? (increasing ? 0 : maxRange) : (coords[i - 1] + coords[i]) / 2
    const edge2 = i === 11 ? (increasing ? maxRange : 0) : (coords[i + 1] + coords[i]) / 2
    result[nums[i]] = { center: coords[i], min: Math.min(edge1, edge2), max: Math.max(edge1, edge2) }
  }
  return result
}

// 判断是否为时间/表头等非课程文字
export function isTimeOrHeader(str) {
  const t = str.trim()
  if (/^\d{1,2}:\d{2}$/.test(t)) return true
  if (['时间段', '节次', '上午', '下午', '晚上'].includes(t)) return true
  if (/^实验时/.test(t) || /^段\d$/.test(t)) return true
  if (/^学号/.test(t) || /课表/.test(t) || /学期/.test(t)) return true
  if (/打印时间/.test(t)) return true
  if (/理论.*实践/.test(t) || /^[:：]$/.test(t)) return true
  return false
}

// 从文字中提取周次信息
export function parseWeeks(text) {
  const m = text.match(/(\d+)\s*[-—~至]\s*(\d+)\s*周/)
  if (m) return { startWeek: parseInt(m[1], 10), endWeek: parseInt(m[2], 10) }
  const m3 = text.match(/(\d+)\s*周/)
  if (m3) {
    const w = parseInt(m3[1], 10)
    return { startWeek: w, endWeek: w }
  }
  return null
}

// 从文字中提取节次信息
export function parseSections(text) {
  const m = text.match(/\((\d+)\s*[-—~]\s*(\d+)\s*节\)/)
  if (m) return { startSection: parseInt(m[1], 10), endSection: parseInt(m[2], 10) }
  const m2 = text.match(/(\d+)\s*[-—~]\s*(\d+)\s*节/)
  if (m2) return { startSection: parseInt(m2[1], 10), endSection: parseInt(m2[2], 10) }
  const m3 = text.match(/第\s*(\d+)\s*[-—~]\s*(\d+)\s*节/)
  if (m3) return { startSection: parseInt(m3[1], 10), endSection: parseInt(m3[2], 10) }
  const m4 = text.match(/(\d+)\s*节/)
  if (m4) {
    const s = parseInt(m4[1], 10)
    return { startSection: s, endSection: s }
  }
  return null
}

// 解析单元格内的文字，提取课程信息
export function parseCellContent(lines) {
  if (!lines || lines.length === 0) return null
  const fullText = lines.join('').replace(/\s+/g, ' ').trim()
  if (!fullText) return null

  let location = ''
  const locMatch = fullText.match(/场地[:：]\s*([^\s/]+)/)
  if (locMatch) location = locMatch[1]
  if (!location) {
    for (const line of lines) {
      const t = line.trim()
      if ((/楼|室/.test(t) || /^教\d/.test(t)) && !/场地|教师|校区/.test(t)) {
        location = t
        break
      }
    }
  }

  let teacher = ''
  const teacherMatch = fullText.match(/教师[:：]\s*([^\s/]+)/)
  if (teacherMatch) teacher = teacherMatch[1]
  if (!teacher) {
    for (const line of lines) {
      const t = line.trim()
      if (/老师|教授/.test(t)) {
        teacher = t
        break
      }
    }
  }

  const weeks = parseWeeks(fullText)
  const sections = parseSections(fullText)

  let name = ''
  const sectionMatch = fullText.match(/\(\d+\s*[-—~]\s*\d+\s*节\)/)
  if (sectionMatch) {
    name = fullText.substring(0, sectionMatch.index).trim()
  }
  if (!name) {
    const sectionMatch2 = fullText.match(/\d+\s*[-—~]\s*\d+\s*节/)
    if (sectionMatch2) {
      name = fullText.substring(0, sectionMatch2.index).trim()
    }
  }
  if (!name) {
    for (const line of lines) {
      const t = line.trim()
      if (t && !/周/.test(t) && !SECTION_PATTERN.test(t) && !/场地|教师|校区/.test(t)) {
        name = t.replace(/\(.*?\)|（.*?）/g, '').trim()
        break
      }
    }
  }

  if (!name) return null
  name = name.replace(/^[/]+|[/]+$/g, '').trim()
  if (!name) return null

  return {
    name,
    location,
    teacher,
    startWeek: weeks ? weeks.startWeek : 1,
    endWeek: weeks ? weeks.endWeek : 16,
    startSection: sections ? sections.startSection : null,
    endSection: sections ? sections.endSection : null,
  }
}

// 将文字项按行分组（y 接近的归为同一行）
export function groupLines(cellItems, tolerance = 5) {
  if (cellItems.length === 0) return []
  const sorted = [...cellItems].sort((a, b) => a.y - b.y)
  const lines = []
  let current = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].y - current[0].y) <= tolerance) {
      current.push(sorted[i])
    } else {
      lines.push(current)
      current = [sorted[i]]
    }
  }
  lines.push(current)
  return lines.map((line) => line.sort((a, b) => a.x - b.x).map((it) => it.str).join(''))
}

// 主解析函数：从规范化文字项数组解析出课表课程数组
export function parseScheduleFromTextItems(items, pageWidth, pageHeight) {
  const orientation = detectOrientation(items)
  const dayBounds = detectDayBounds(items, pageWidth, pageHeight, orientation)
  const sectionBounds = detectSectionBounds(items, pageWidth, pageHeight, orientation)

  const sectionWidth = Math.abs(sectionBounds[2].center - sectionBounds[1].center)
  const gapThreshold = sectionWidth * 0.45

  const courses = []
  let colorIdx = 0

  for (let day = 1; day <= 7; day++) {
    const dayItems = items.filter((it) => {
      const coord = orientation === 'vertical' ? it.x : it.y
      return (
        coord >= dayBounds[day].min &&
        coord <= dayBounds[day].max &&
        !DAY_PATTERNS.some(([re]) => re.test(it.str)) &&
        !SECTION_PATTERN.test(it.str) &&
        !isTimeOrHeader(it.str) &&
        !/^\d+$/.test(it.str.trim())
      )
    })
    if (dayItems.length === 0) continue

    const xSorted = [...dayItems].sort((a, b) => a.x - b.x)
    const xBlocks = []
    let xCur = [xSorted[0]]
    for (let i = 1; i < xSorted.length; i++) {
      if (xSorted[i].x - xCur[xCur.length - 1].x > gapThreshold) {
        xBlocks.push(xCur)
        xCur = [xSorted[i]]
      } else {
        xCur.push(xSorted[i])
      }
    }
    xBlocks.push(xCur)

    for (const xBlock of xBlocks) {
      const lines = groupLines(xBlock, 5)
      const info = parseCellContent(lines)
      if (info && info.name) {
        let startSec = info.startSection
        let endSec = info.endSection

        if (!startSec || !endSec) {
          const coordKey = orientation === 'vertical' ? 'y' : 'x'
          const coords = xBlock.map((it) => it[coordKey])
          const cMin = Math.min(...coords)
          const cMax = Math.max(...coords)
          for (let s = 1; s <= 12; s++) {
            if (cMin >= sectionBounds[s].min && cMin <= sectionBounds[s].max) startSec = startSec || s
            if (cMax >= sectionBounds[s].min && cMax <= sectionBounds[s].max) endSec = endSec || s
          }
        }

        courses.push({
          name: info.name,
          day,
          startSection: startSec || 1,
          endSection: endSec || startSec || 1,
          location: info.location,
          teacher: info.teacher,
          startWeek: info.startWeek,
          endWeek: info.endWeek,
          color: COLORS[colorIdx % COLORS.length],
        })
        colorIdx++
      }
    }
  }
  return courses
}

// 顶层函数：读取 PDF 文件并解析课表
export async function parsePdfSchedule(file) {
  const { pdfjsLib } = await import('./pdfWorkerSetup.js')
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/standard_fonts/',
  })
  const pdf = await loadingTask.promise

  const allCourses = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1 })
    const textContent = await page.getTextContent()
    const items = normalizeItems(textContent.items, viewport.height)
    const courses = parseScheduleFromTextItems(items, viewport.width, viewport.height)
    allCourses.push(...courses)
  }
  await pdf.cleanup()
  return allCourses
}