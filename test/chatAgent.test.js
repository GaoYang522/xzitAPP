import { setActivePinia, createPinia } from 'pinia'
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'

vi.mock('../src/utils/llmProvider.js', () => ({
  chatWithLLM: vi.fn(),
}))

vi.mock('../src/utils/appDataContext.js', () => ({
  getAppDataSummary: vi.fn(() => '模拟数据摘要：今日课程-高数'),
}))

import { chatWithLLM } from '../src/utils/llmProvider.js'
import { extractTodoCommands, handle } from '../src/agents/chatAgent.js'
import { handleMessage } from '../src/agents/mainAgent.js'
import { useToolsStore } from '../src/stores/tools.js'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('extractTodoCommands', () => {
  test('提取单个待办指令', () => {
    const content = '已为你创建待办：跑步\n[CREATE_TODO:{"title":"跑步","dueDate":"","priority":""}]'
    const { commands, cleanContent } = extractTodoCommands(content)
    expect(commands).toHaveLength(1)
    expect(commands[0].title).toBe('跑步')
    expect(cleanContent).toBe('已为你创建待办：跑步')
  })

  test('提取带日期和优先级的待办', () => {
    const content = '好的\n[CREATE_TODO:{"title":"买书","dueDate":"2026-10-22","priority":"high"}]'
    const { commands, cleanContent } = extractTodoCommands(content)
    expect(commands).toHaveLength(1)
    expect(commands[0].title).toBe('买书')
    expect(commands[0].dueDate).toBe('2026-10-22')
    expect(commands[0].priority).toBe('high')
  })

  test('提取多个待办指令', () => {
    const content = '已创建\n[CREATE_TODO:{"title":"跑步"}]\n[CREATE_TODO:{"title":"看书"}]'
    const { commands } = extractTodoCommands(content)
    expect(commands).toHaveLength(2)
    expect(commands[0].title).toBe('跑步')
    expect(commands[1].title).toBe('看书')
  })

  test('无指令时返回原文', () => {
    const content = '今天有三节课'
    const { commands, cleanContent } = extractTodoCommands(content)
    expect(commands).toHaveLength(0)
    expect(cleanContent).toBe('今天有三节课')
  })

  test('无效JSON被忽略', () => {
    const content = '回复[CREATE_TODO:{invalid}]'
    const { commands, cleanContent } = extractTodoCommands(content)
    expect(commands).toHaveLength(0)
  })
})

describe('chatAgent.handle', () => {
  test('正常聊天回复', async () => {
    chatWithLLM.mockResolvedValue({ content: '你好！今天你有高数课和英语课。' })
    const result = await handle('今天有什么课', {}, { apiKey: 'sk-test' })
    expect(result.content).toBe('你好！今天你有高数课和英语课。')
    expect(result.createdTodos).toBeUndefined()
    expect(chatWithLLM).toHaveBeenCalledOnce()
  })

  test('创建待办', async () => {
    chatWithLLM.mockResolvedValue({
      content: '好的，已为你创建待办：跑步\n[CREATE_TODO:{"title":"跑步","dueDate":"","priority":""}]',
    })
    const tools = useToolsStore()
    expect(tools.todos).toHaveLength(0)

    const result = await handle('我下午要去跑步', {}, { apiKey: 'sk-test' })
    expect(result.content).toBe('好的，已为你创建待办：跑步')
    expect(result.createdTodos).toHaveLength(1)
    expect(result.createdTodos[0].title).toBe('跑步')
    expect(tools.todos).toHaveLength(1)
    expect(tools.todos[0].title).toBe('跑步')
    expect(tools.todos[0].done).toBe(false)
  })

  test('创建带日期和优先级的待办', async () => {
    chatWithLLM.mockResolvedValue({
      content: '已创建\n[CREATE_TODO:{"title":"买书","dueDate":"2026-10-22","priority":"high"}]',
    })
    const tools = useToolsStore()
    const result = await handle('明天帮我买书', {}, { apiKey: 'sk-test' })
    expect(result.createdTodos[0].title).toBe('买书')
    expect(tools.todos[0].dueDate).toBe('2026-10-22')
    expect(tools.todos[0].priority).toBe('high')
  })

  test('引导询问不创建待办', async () => {
    chatWithLLM.mockResolvedValue({ content: '下午几点去跑步？' })
    const tools = useToolsStore()
    const result = await handle('我下午要去跑步', {}, { apiKey: 'sk-test' })
    expect(result.content).toBe('下午几点去跑步？')
    expect(result.createdTodos).toBeUndefined()
    expect(tools.todos).toHaveLength(0)
  })

  test('文件内容作为上下文传入', async () => {
    chatWithLLM.mockResolvedValue({ content: '文件已读取' })
    await handle('总结这个文件', { fileContent: '这是文件内容' }, { apiKey: 'sk-test' })
    const callMessages = chatWithLLM.mock.calls[0][0]
    expect(callMessages[1].content).toContain('文件内容')
    expect(callMessages[1].content).toContain('这是文件内容')
    expect(callMessages[1].content).toContain('总结这个文件')
  })

  test('LLM错误处理', async () => {
    chatWithLLM.mockResolvedValue({ error: 'API_ERROR', message: '请求失败' })
    const result = await handle('你好', {}, { apiKey: 'sk-test' })
    expect(result.error).toBe('API_ERROR')
  })

  test('system prompt包含数据摘要', async () => {
    chatWithLLM.mockResolvedValue({ content: '回复' })
    await handle('你好', {}, { apiKey: 'sk-test' })
    const callMessages = chatWithLLM.mock.calls[0][0]
    expect(callMessages[0].role).toBe('system')
    expect(callMessages[0].content).toContain('模拟数据摘要')
  })
})

describe('mainAgent 兜底路由到chat', () => {
  test('非专业问题路由到chat Agent', async () => {
    chatWithLLM.mockResolvedValueOnce({
      content: '{"type": "unclear"}',
    })
    chatWithLLM.mockResolvedValueOnce({
      content: '你好！有什么可以帮你的？',
    })
    const result = await handleMessage('你好', { apiKey: 'sk-test' })
    expect(result.type).toBe('single')
    expect(result.agentId).toBe('chat')
    expect(result.routeInfo.method).toBe('fallback')
    expect(result.content).toBe('你好！有什么可以帮你的？')
  })

  test('今天有什么课路由到chat Agent', async () => {
    chatWithLLM.mockResolvedValueOnce({
      content: '{"type": "single", "agentId": "chat"}',
    })
    chatWithLLM.mockResolvedValueOnce({
      content: '今天有高数和英语两节课',
    })
    const result = await handleMessage('今天有什么课', { apiKey: 'sk-test' })
    expect(result.agentId).toBe('chat')
    expect(result.content).toBe('今天有高数和英语两节课')
  })

  test('chat Agent创建待办时传递createdTodos', async () => {
    chatWithLLM.mockResolvedValueOnce({
      content: '{"type": "unclear"}',
    })
    chatWithLLM.mockResolvedValueOnce({
      content: '已创建\n[CREATE_TODO:{"title":"跑步"}]',
    })
    const result = await handleMessage('帮我记一下跑步', { apiKey: 'sk-test' })
    expect(result.createdTodos).toHaveLength(1)
    expect(result.createdTodos[0].title).toBe('跑步')
  })
})