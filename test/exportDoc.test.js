import { describe, test, expect } from 'vitest'
import { parseMarkdownToElements, generateDocxBlob } from '../src/utils/exportDocx.js'
import { parseMarkdownToPdfLines, generatePdfBlob } from '../src/utils/exportPdf.js'

describe('exportDocx', () => {
  test('parseMarkdownToElements 解析标题和段落', () => {
    const md = '# 实验目的\n\n测试电路的放大倍数。'
    const elements = parseMarkdownToElements(md)
    expect(elements.length).toBeGreaterThanOrEqual(2)
  })

  test('parseMarkdownToElements 解析表格', () => {
    const md = '| 输入 | 输出 |\n|------|------|\n| 1V   | 2V   |\n| 2V   | 4V   |'
    const elements = parseMarkdownToElements(md)
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  test('parseMarkdownToElements 解析代码块', () => {
    const md = '```\nint x = 1;\n```'
    const elements = parseMarkdownToElements(md)
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  test('parseMarkdownToElements 解析列表', () => {
    const md = '- 项目一\n- 项目二\n- 项目三'
    const elements = parseMarkdownToElements(md)
    expect(elements.length).toBe(3)
  })

  test('generateDocxBlob 返回 Blob 对象', async () => {
    const md = '# 测试报告\n\n这是一个测试。'
    const blob = await generateDocxBlob(md)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  test('空 Markdown 不报错', () => {
    const elements = parseMarkdownToElements('')
    expect(elements).toEqual([])
  })
})

describe('exportPdf', () => {
  test('parseMarkdownToPdfLines 解析标题', () => {
    const md = '# 实验目的'
    const lines = parseMarkdownToPdfLines(md)
    expect(lines.length).toBeGreaterThanOrEqual(1)
    expect(lines[0].text).toContain('实验目的')
    expect(lines[0].bold).toBe(true)
  })

  test('parseMarkdownToPdfLines 解析段落', () => {
    const md = '这是一段文字。'
    const lines = parseMarkdownToPdfLines(md)
    expect(lines.length).toBe(1)
    expect(lines[0].text).toBe('这是一段文字。')
  })

  test('parseMarkdownToPdfLines 解析表格', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |'
    const lines = parseMarkdownToPdfLines(md)
    expect(lines.length).toBeGreaterThanOrEqual(2)
  })

  test('parseMarkdownToPdfLines 解析代码块', () => {
    const md = '```\nprint("hello")\n```'
    const lines = parseMarkdownToPdfLines(md)
    expect(lines.some((l) => l.text.includes('code'))).toBe(true)
    expect(lines.some((l) => l.text.includes('print'))).toBe(true)
  })

  test('generatePdfBlob 返回 Blob 对象', () => {
    const md = '# 测试报告\n\n这是一个测试。'
    const blob = generatePdfBlob(md)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  test('多页内容正确分页', () => {
    const lines = []
    for (let i = 0; i < 100; i++) {
      lines.push(`第 ${i + 1} 行内容`)
    }
    const md = lines.join('\n\n')
    const blob = generatePdfBlob(md)
    expect(blob.size).toBeGreaterThan(1000)
  })
})