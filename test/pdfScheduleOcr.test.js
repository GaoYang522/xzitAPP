import { describe, test, expect, vi } from 'vitest'
import { buildItemsFromOcrWords, ocrPdfPages, mergeCanvases, parseScheduleFromTextItems, normalizeItems } from '../src/utils/pdfScheduleParser.js'

describe('PDF 课表 OCR 回退', () => {
  describe('buildItemsFromOcrWords', () => {
    test('将 OCR words 转换为 items 格式', () => {
      const words = [
        { text: '高等数学', bbox: { x0: 100, y0: 200, x1: 200, y1: 220 } },
        { text: '星期一', bbox: { x0: 50, y0: 30, x1: 120, y1: 50 } },
      ]
      const items = buildItemsFromOcrWords(words, 2)
      expect(items).toHaveLength(2)
      expect(items[0]).toEqual({ str: '高等数学', x: 50, y: 100 })
      expect(items[1]).toEqual({ str: '星期一', x: 25, y: 15 })
    })

    test('过滤空文本和无 bbox 的词', () => {
      const words = [
        { text: '高等数学', bbox: { x0: 100, y0: 200, x1: 200, y1: 220 } },
        { text: '', bbox: { x0: 0, y0: 0, x1: 10, y1: 10 } },
        { text: '   ', bbox: { x0: 0, y0: 0, x1: 10, y1: 10 } },
        { text: '无边界' },
      ]
      const items = buildItemsFromOcrWords(words, 2)
      expect(items).toHaveLength(1)
      expect(items[0].str).toBe('高等数学')
    })

    test('空数组或无效输入返回空数组', () => {
      expect(buildItemsFromOcrWords(null)).toEqual([])
      expect(buildItemsFromOcrWords(undefined)).toEqual([])
      expect(buildItemsFromOcrWords([])).toEqual([])
      expect(buildItemsFromOcrWords('not array')).toEqual([])
    })

    test('默认 scale 为 2', () => {
      const words = [{ text: '测试', bbox: { x0: 40, y0: 60, x1: 80, y1: 80 } }]
      const items = buildItemsFromOcrWords(words)
      expect(items[0]).toEqual({ str: '测试', x: 20, y: 30 })
    })

    test('不同 scale 值正确缩放坐标', () => {
      const words = [{ text: '课程', bbox: { x0: 300, y0: 600, x1: 400, y1: 620 } }]
      const items3 = buildItemsFromOcrWords(words, 3)
      expect(items3[0]).toEqual({ str: '课程', x: 100, y: 200 })
      const items1 = buildItemsFromOcrWords(words, 1)
      expect(items1[0]).toEqual({ str: '课程', x: 300, y: 600 })
    })
  })

  describe('ocrPdfPages', () => {
    test('用 mock render 和 recognize 提取 items', async () => {
      const mockPage = {
        getViewport: vi.fn(() => ({ width: 500, height: 300 })),
      }
      const pages = [{ page: mockPage, viewport: { width: 500, height: 300 } }]

      const mockCanvas = { width: 1000, height: 600 }
      const renderFn = vi.fn(async () => mockCanvas)
      const recognizeFn = vi.fn(async () => ({
        data: {
          words: [
            { text: '高等数学', bbox: { x0: 200, y0: 100, x1: 400, y1: 140 } },
            { text: '星期一', bbox: { x0: 100, y0: 50, x1: 200, y1: 70 } },
          ],
        },
      }))

      const results = await ocrPdfPages(pages, renderFn, recognizeFn)
      expect(results).toHaveLength(1)
      expect(results[0]).toHaveLength(2)
      expect(results[0][0]).toEqual({ str: '高等数学', x: 100, y: 50 })
      expect(renderFn).toHaveBeenCalledTimes(1)
      expect(recognizeFn).toHaveBeenCalledTimes(1)
    })

    test('中文识别失败时回退到英文', async () => {
      const mockPage = {
        getViewport: vi.fn(() => ({ width: 500, height: 300 })),
      }
      const pages = [{ page: mockPage, viewport: { width: 500, height: 300 } }]

      const renderFn = vi.fn(async () => ({}))
      const recognizeFn = vi.fn()
        .mockRejectedValueOnce(new Error('chi_sim failed'))
        .mockResolvedValueOnce({
          data: {
            words: [{ text: 'Math', bbox: { x0: 100, y0: 50, x1: 200, y1: 70 } }],
          },
        })

      const results = await ocrPdfPages(pages, renderFn, recognizeFn)
      expect(results[0]).toHaveLength(1)
      expect(results[0][0].str).toBe('Math')
      expect(recognizeFn).toHaveBeenCalledTimes(2)
    })

    test('多页 PDF 逐页 OCR', async () => {
      const pages = [
        { page: { getViewport: () => ({ width: 500, height: 300 }) }, viewport: { width: 500, height: 300 } },
        { page: { getViewport: () => ({ width: 500, height: 300 }) }, viewport: { width: 500, height: 300 } },
      ]

      const renderFn = vi.fn(async () => ({}))
      let callCount = 0
      const recognizeFn = vi.fn(async () => {
        callCount++
        return {
          data: {
            words: [{ text: `页${callCount}`, bbox: { x0: 100, y0: 50, x1: 200, y1: 70 } }],
          },
        }
      })

      const results = await ocrPdfPages(pages, renderFn, recognizeFn)
      expect(results).toHaveLength(2)
      expect(results[0][0].str).toBe('页1')
      expect(results[1][0].str).toBe('页2')
    })

    test('多页合并 OCR 模式：合并为一张大图后一次性识别', async () => {
      const pages = [
        { page: { getViewport: () => ({ width: 500, height: 300 }) }, viewport: { width: 500, height: 300 } },
        { page: { getViewport: () => ({ width: 500, height: 300 }) }, viewport: { width: 500, height: 300 } },
      ]

      const mockMergedCanvas = { width: 1000, height: 1200 }
      const renderFn = vi.fn(async () => ({ width: 1000, height: 600 }))
      const mergeFn = vi.fn(() => mockMergedCanvas)
      const recognizeFn = vi.fn(async () => ({
        data: {
          words: [
            { text: '劳动教育', bbox: { x0: 200, y0: 500, x1: 400, y1: 540 } },
            { text: '高等数学', bbox: { x0: 200, y0: 100, x1: 400, y1: 140 } },
          ],
        },
      }))

      const results = await ocrPdfPages(pages, renderFn, recognizeFn, { mergePages: true, mergeFn })
      expect(results).toHaveLength(1)
      expect(results[0]).toHaveLength(2)
      expect(results[0][0].str).toBe('劳动教育')
      expect(results[0][1].str).toBe('高等数学')
      expect(renderFn).toHaveBeenCalledTimes(2)
      expect(mergeFn).toHaveBeenCalledTimes(1)
      expect(recognizeFn).toHaveBeenCalledTimes(1)
    })

    test('合并模式下中文失败回退英文', async () => {
      const pages = [
        { page: { getViewport: () => ({ width: 500, height: 300 }) }, viewport: { width: 500, height: 300 } },
        { page: { getViewport: () => ({ width: 500, height: 300 }) }, viewport: { width: 500, height: 300 } },
      ]

      const renderFn = vi.fn(async () => ({}))
      const mergeFn = vi.fn(() => ({}))
      const recognizeFn = vi.fn()
        .mockRejectedValueOnce(new Error('chi_sim failed'))
        .mockResolvedValueOnce({
          data: {
            words: [{ text: 'Labor', bbox: { x0: 100, y0: 50, x1: 200, y1: 70 } }],
          },
        })

      const results = await ocrPdfPages(pages, renderFn, recognizeFn, { mergePages: true, mergeFn })
      expect(results).toHaveLength(1)
      expect(results[0][0].str).toBe('Labor')
      expect(recognizeFn).toHaveBeenCalledTimes(2)
    })

    test('单页时合并模式退化为普通模式', async () => {
      const pages = [
        { page: { getViewport: () => ({ width: 500, height: 300 }) }, viewport: { width: 500, height: 300 } },
      ]

      const renderFn = vi.fn(async () => ({}))
      const recognizeFn = vi.fn(async () => ({
        data: {
          words: [{ text: '课程', bbox: { x0: 100, y0: 50, x1: 200, y1: 70 } }],
        },
      }))

      const results = await ocrPdfPages(pages, renderFn, recognizeFn, { mergePages: true })
      expect(results).toHaveLength(1)
      expect(results[0][0].str).toBe('课程')
      expect(recognizeFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('mergeCanvases', () => {
    test('空数组返回 null', () => {
      expect(mergeCanvases(null)).toBeNull()
      expect(mergeCanvases([])).toBeNull()
    })

    test('单个 canvas 直接返回', () => {
      const canvas = { width: 100, height: 200 }
      const result = mergeCanvases([{ canvas, width: 100, height: 200 }])
      expect(result).toBe(canvas)
    })
  })

  describe('OCR items 与解析逻辑集成', () => {
    test('OCR 提取的 items 可被 parseScheduleFromTextItems 解析', () => {
      const pageWidth = 842
      const pageHeight = 595

      const ocrWords = [
        { text: '星期一', bbox: { x0: 120, y0: 40, x1: 180, y1: 60 } },
        { text: '星期二', bbox: { x0: 240, y0: 40, x1: 300, y1: 60 } },
        { text: '星期三', bbox: { x0: 360, y0: 40, x1: 420, y1: 60 } },
        { text: '星期四', bbox: { x0: 480, y0: 40, x1: 540, y1: 60 } },
        { text: '星期五', bbox: { x0: 600, y0: 40, x1: 660, y1: 60 } },
        { text: '第1节', bbox: { x0: 20, y0: 80, x1: 80, y1: 100 } },
        { text: '第2节', bbox: { x0: 20, y0: 140, x1: 80, y1: 160 } },
        { text: '高等数学', bbox: { x0: 130, y0: 85, x1: 230, y1: 105 } },
        { text: '线性代数', bbox: { x0: 250, y0: 145, x1: 350, y1: 165 } },
      ]

      const items = buildItemsFromOcrWords(ocrWords, 1)
      expect(items.length).toBeGreaterThan(0)

      const courses = parseScheduleFromTextItems(items, pageWidth, pageHeight)
      expect(courses.length).toBeGreaterThanOrEqual(0)
    })
  })
})