import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { buildHistoryMessages } from '../src/utils/chatHistory.js'

vi.mock('../src/utils/llmProvider.js', () => ({
  chatWithLLM: vi.fn(),
}))

vi.mock('../src/utils/appDataContext.js', () => ({
  getAppDataSummary: vi.fn(() => '模拟数据摘要'),
}))

import { chatWithLLM } from '../src/utils/llmProvider.js'
import { handle as matlabHandle } from '../src/agents/matlabAgent.js'
import { handle as chatHandle } from '../src/agents/chatAgent.js'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('buildHistoryMessages', () => {
  test('正确转换历史消息', () => {
    const history = [
      { role: 'user', content: '你好' },
      { role: 'assistant', content: '你好！有什么可以帮你的？' },
      { role: 'user', content: '今天有什么课' },
    ]
    const result = buildHistoryMessages(history)
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ role: 'user', content: '你好' })
    expect(result[1]).toEqual({ role: 'assistant', content: '你好！有什么可以帮你的？' })
    expect(result[2]).toEqual({ role: 'user', content: '今天有什么课' })
  })

  test('限制最大消息数', () => {
    const history = Array.from({ length: 15 }, (_, i) => ({
      role: 'user',
      content: `消息${i}`,
    }))
    const result = buildHistoryMessages(history, 10)
    expect(result).toHaveLength(10)
    expect(result[0].content).toBe('消息5')
    expect(result[9].content).toBe('消息14')
  })

  test('空历史返回空数组', () => {
    expect(buildHistoryMessages([])).toEqual([])
    expect(buildHistoryMessages(null)).toEqual([])
    expect(buildHistoryMessages(undefined)).toEqual([])
  })

  test('非数组返回空数组', () => {
    expect(buildHistoryMessages('not array')).toEqual([])
    expect(buildHistoryMessages({})).toEqual([])
  })

  test('默认最大10条', () => {
    const history = Array.from({ length: 20 }, (_, i) => ({
      role: 'user',
      content: `消息${i}`,
    }))
    const result = buildHistoryMessages(history)
    expect(result).toHaveLength(10)
  })
})

describe('子Agent使用历史消息', () => {
  test('matlabAgent将历史消息加入LLM请求', async () => {
    chatWithLLM.mockResolvedValue({ content: '回复' })
    const history = [
      { role: 'user', content: '之前的MATLAB问题' },
      { role: 'assistant', content: '之前的回复' },
    ]
    await matlabHandle('新问题', { history }, { apiKey: 'sk-test' })
    const messages = chatWithLLM.mock.calls[0][0]
    expect(messages[0].role).toBe('system')
    expect(messages[1].content).toBe('之前的MATLAB问题')
    expect(messages[2].content).toBe('之前的回复')
    expect(messages[3].content).toBe('新问题')
  })

  test('chatAgent将历史消息加入LLM请求', async () => {
    chatWithLLM.mockResolvedValue({ content: '回复' })
    const history = [
      { role: 'user', content: '今天有什么课' },
      { role: 'assistant', content: '今天有高数和英语' },
    ]
    await chatHandle('那明天呢', { history }, { apiKey: 'sk-test' })
    const messages = chatWithLLM.mock.calls[0][0]
    expect(messages[1].content).toBe('今天有什么课')
    expect(messages[2].content).toBe('今天有高数和英语')
    expect(messages[3].content).toBe('那明天呢')
  })

  test('无历史消息时正常工作', async () => {
    chatWithLLM.mockResolvedValue({ content: '回复' })
    await matlabHandle('新问题', {}, { apiKey: 'sk-test' })
    const messages = chatWithLLM.mock.calls[0][0]
    expect(messages[0].role).toBe('system')
    expect(messages[1].content).toBe('新问题')
  })
})