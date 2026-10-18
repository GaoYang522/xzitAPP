// PDF 课表解析工具
// 核心解析逻辑为纯函数，可在测试中独立验证；parsePdfSchedule 负责读取 PDF 并调用纯函数。

const DAY_PATTERNS = [
  [/星期一|周一/, 1], [/星期二|周二/, 2], [/星期三|周三/, 3],
  [/星期四|周四/, 4], [/星期五|周五/, 5], [/星期六|周六/, 6], [/星期日|周日/, 7],
]

const SECTION_PATTERN = /第\s*(\d+)\s*节/

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

// 检测星期列：返回长度为 8 的数组，index 1-7 对应周一到周日，值为 { center, left, right }
export function detectDayColumns(items, pageWidth) {
  const found = {}
  for (const it of items) {
    for (const [re, day] of DAY_PATTERNS) {
      if (re.test(it.str) && !found[day]) {
        found[day] = it.x
        break
      }
    }
  }
  const days = [1, 2, 3, 4, 5, 6, 7]
  const allFound = days.every((d) => found[d] !== undefined)
  if (!allFound) {
    const colWidth = pageWidth / 8
    const result = [null]
    for (let d = 1; d <= 7; d++) {
      result[d] = { center: colWidth * (d + 1), left: colWidth * (d + 0.5), right: colWidth * (d + 1.5) }
    }
    return result
  }
  const xs = days.map((d) => found[d])
  const result = [null]
  for (let i = 0; i < 7; i++) {
    const left = i === 0 ? 0 : (xs[i - 1] + xs[i]) / 2
    const right = i === 6 ? pageWidth : (xs[i] + xs[i + 1]) / 2
    result[days[i]] = { center: xs[i], left, right }
  }
  return result
}

// 检测节次行：返回长度为 13 的数组，index 1-12 对应第1节到第12节，值为 { center, top, bottom }
export function detectSectionRows(items, pageHeight) {
  const found = {}
  for (const it of items) {
    const m = it.str.match(SECTION_PATTERN)
    if (m) {
      const n = parseInt(m[1], 10)
      if (n >= 1 && n <= 12 && found[n] === undefined) found[n] = it.y
    }
  }
  const nums = []
  for (let n = 1; n <= 12; n++) nums.push(n)
  const allFound = nums.every((n) => found[n] !== undefined)
  if (!allFound) {
    const rowHeight = pageHeight / 13
    const result = [null]
    for (let n = 1; n <= 12; n++) {
      result[n] = { center: rowHeight * n, top: rowHeight * (n - 0.5), bottom: rowHeight * (n + 0.5) }
    }
    return result
  }
  const ys = nums.map((n) => found[n])
  const result = [null]
  for (let i = 0; i < 12; i++) {
    const top = i === 0 ? 0 : (ys[i - 1] + ys[i]) / 2
    const bottom = i === 11 ? pageHeight : (ys[i] + ys[i + 1]) / 2
    result[nums[i]] = { center: ys[i], top, bottom }
  }
  return result
}

// 收集落在指定 x 列、y 行范围内的文字项
export function collectCellItems(items, col, row) {
  return items.filter((it) => it.x >= col.left && it.x <= col.right && it.y >= row.top && it.y <= row.bottom)
}

// 从一段文本中提取周次信息，返回 { startWeek, endWeek } 或 null
export function parseWeeks(text) {
  const m = text.match(/(\d+)\s*[-—~至]\s*(\d+)\s*周/)
  if (m) return { startWeek: parseInt(m[1], 10), endWeek: parseInt(m[2], 10) }
  const m2 = text.match(/第\s*(\d+)\s*[-—~]\s*(\d+)\s*周/)
  if (m2) return { startWeek: parseInt(m2[1], 10), endWeek: parseInt(m2[2], 10) }
  const m3 = text.match(/(\d+)\s*周/)
  if (m3) {
    const w = parseInt(m3[1], 10)
    return { startWeek: w, endWeek: w }
  }
  return null
}

// 从节次文字中提取起止节次，如 "1-2节" => { startSection:1, endSection:2 }
export function parseSections(text) {
  const m = text.match(/(\d+)\s*[-—~]\s*(\d+)\s*节/)
  if (m) return { startSection: parseInt(m[1], 10), endSection: parseInt(m[2], 10) }
  const m2 = text.match(/第\s*(\d+)\s*[-—~]\s*(\d+)\s*节/)
  if (m2) return { startSection: parseInt(m2[1], 10), endSection: parseInt(m2[2], 10) }
  const m3 = text.match(/(\d+)\s*节/)
  if (m3) {
    const s = parseInt(m3[1], 10)
    return { startSection: s, endSection: s }
  }
  return null
}

// 解析单元格内的文字，提取课程信息
// lines: 字符串数组（按 y 排序的文本行）
export function parseCellContent(lines) {
  if (!lines || lines.length === 0) return null
  const fullText = lines.join(' ').replace(/\s+/g, ' ').trim()
  if (!fullText) return null

  const weeks = parseWeeks(fullText)
  const sections = parseSections(fullText)

  let name = ''
  let location = ''
  let teacher = ''

  for (const line of lines) {
    const t = line.trim()
    if (!t) continue
    if (!name && !/周/.test(t) && !SECTION_PATTERN.test(t) && !/教|楼|室/.test(t) && t.length >= 2) {
      name = t.replace(/\(.*?\)|（.*?）/g, '').trim()
      continue
    }
    if (/教|楼|室/.test(t) && !location) {
      location = t
      continue
    }
    if (!teacher && (/老师|教授/.test(t) || /^[\u4e00-\u9fa5]{2,4}$/.test(t))) {
      teacher = t
      continue
    }
  }
  if (!name) {
    for (const line of lines) {
      const t = line.trim()
      if (t && !/周/.test(t) && !SECTION_PATTERN.test(t) && !/教|楼|室/.test(t)) {
        name = t.replace(/\(.*?\)|（.*?）/g, '').trim()
        break
      }
    }
  }

  if (!name) return null
  return {
    name,
    location: location || '',
    teacher: teacher || '',
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

const COLORS = ['blue', 'purple', 'orange', 'green', 'pink', 'cyan']

// 主解析函数：从规范化文字项数组解析出课表课程数组
export function parseScheduleFromTextItems(items, pageWidth, pageHeight) {
  const cols = detectDayColumns(items, pageWidth)
  const rows = detectSectionRows(items, pageHeight)

  const courses = []
  let colorIdx = 0

  for (let day = 1; day <= 7; day++) {
    const colItems = items.filter(
      (it) =>
        it.x >= cols[day].left &&
        it.x <= cols[day].right &&
        !DAY_PATTERNS.some(([re]) => re.test(it.str)) &&
        !SECTION_PATTERN.test(it.str)
    )
    if (colItems.length === 0) continue

    const sectionItems = Array.from({ length: 13 }, () => [])
    for (const it of colItems) {
      let bestSection = 1
      let bestDist = Infinity
      for (let s = 1; s <= 12; s++) {
        const dist = Math.abs(it.y - rows[s].center)
        if (dist < bestDist) {
          bestDist = dist
          bestSection = s
        }
      }
      sectionItems[bestSection].push(it)
    }

    let blockStart = null
    let blockItems = []
    for (let s = 1; s <= 13; s++) {
      if (s <= 12 && sectionItems[s].length > 0) {
        if (blockStart === null) blockStart = s
        blockItems.push(...sectionItems[s])
      } else {
        if (blockStart !== null && blockItems.length > 0) {
          const blockEnd = s - 1
          const lines = groupLines(blockItems)
          const info = parseCellContent(lines)
          if (info && info.name) {
            courses.push({
              name: info.name,
              day,
              startSection: info.startSection || blockStart,
              endSection: info.endSection || blockEnd,
              location: info.location,
              teacher: info.teacher,
              startWeek: info.startWeek,
              endWeek: info.endWeek,
              color: COLORS[colorIdx % COLORS.length],
            })
            colorIdx++
          }
          blockStart = null
          blockItems = []
        }
      }
    }
  }
  return courses
}

// 顶层函数：读取 PDF 文件并解析课表
// file: File 对象（浏览器文件选择框返回的）
// 返回 Promise<课程数组>
export async function parsePdfSchedule(file, pdfjsLib) {
  if (!pdfjsLib) {
    const mod = await import('pdfjs-dist')
    pdfjsLib = mod.default || mod
  }
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
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
  await pdf.destroy()
  return allCourses
}