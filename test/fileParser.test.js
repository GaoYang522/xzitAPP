import { describe, test, expect } from 'vitest'
import { getFileType, parseText, parseFile } from '../src/utils/fileParser.js'

function createMockFile(name, content, type = '') {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(content)
  return {
    name,
    size: bytes.length,
    type,
    arrayBuffer: () => Promise.resolve(bytes.buffer),
  }
}

describe('getFileType', () => {
  test('图片文件', () => {
    expect(getFileType({ name: 'test.png', type: 'image/png' })).toBe('image')
    expect(getFileType({ name: 'photo.jpg', type: 'image/jpeg' })).toBe('image')
    expect(getFileType({ name: 'pic.gif', type: '' })).toBe('image')
  })
  test('PDF文件', () => {
    expect(getFileType({ name: 'doc.pdf', type: 'application/pdf' })).toBe('pdf')
    expect(getFileType({ name: 'doc.pdf', type: '' })).toBe('pdf')
  })
  test('Word文件', () => {
    expect(getFileType({ name: 'doc.docx', type: '' })).toBe('word')
    expect(getFileType({ name: 'doc.doc', type: '' })).toBe('word')
  })
  test('文本文件', () => {
    expect(getFileType({ name: 'notes.txt', type: 'text/plain' })).toBe('text')
    expect(getFileType({ name: 'readme.md', type: '' })).toBe('text')
  })
  test('未知类型', () => {
    expect(getFileType({ name: 'data.csv', type: '' })).toBe('unknown')
    expect(getFileType({ name: 'file.xyz', type: '' })).toBe('unknown')
  })
})

describe('parseText', () => {
  test('解析纯文本', async () => {
    const file = createMockFile('test.txt', 'hello world', 'text/plain')
    const result = await parseText(file)
    expect(result.type).toBe('text')
    expect(result.content).toBe('hello world')
    expect(result.fileName).toBe('test.txt')
    expect(result.fileSize).toBe(11)
  })

  test('解析多行文本', async () => {
    const file = createMockFile('multi.txt', 'line1\nline2\nline3', 'text/plain')
    const result = await parseText(file)
    expect(result.content).toBe('line1\nline2\nline3')
  })

  test('解析中文文本', async () => {
    const file = createMockFile('chinese.txt', '你好世界', 'text/plain')
    const result = await parseText(file)
    expect(result.content).toBe('你好世界')
  })
})

describe('parseFile 路由', () => {
  test('文本文件通过parseFile解析', async () => {
    const file = createMockFile('test.txt', 'hello', 'text/plain')
    const result = await parseFile(file)
    expect(result.type).toBe('text')
    expect(result.content).toBe('hello')
  })

  test('不支持的类型返回错误', async () => {
    const file = createMockFile('data.xyz', '', '')
    const result = await parseFile(file)
    expect(result.type).toBe('unknown')
    expect(result.error).toBeTruthy()
    expect(result.content).toBe('')
  })
})