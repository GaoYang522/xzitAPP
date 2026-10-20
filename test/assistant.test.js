import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAssistantStore } from '../src/stores/assistant.js'

function mockLlmResponse(content) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      choices: [{ message: { content } }],
      usage: { total_tokens: 10 },
    }),
    text: () => Promise.resolve(content),
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('assistant store - 基础状态', () => {
  test('初始状态正确', () => {
    const store = useAssistantStore()
    expect(store.apiConfig.llmProvider).toBe('deepseek')
    expect(store.apiConfig.llmApiKey).toBe('')
    expect(store.apiConfig.llmBaseUrl).toBe('https://api.deepseek.com')
    expect(store.apiConfig.llmModel).toBe('deepseek-chat')
    expect(store.sessions).toEqual([])
    expect(store.currentSessionId).toBeNull()
  })

  test('hasApiKey getter 正确', () => {
    const store = useAssistantStore()
    expect(store.hasApiKey).toBe(false)
    store.setApiConfig({ llmApiKey: 'sk-test' })
    expect(store.hasApiKey).toBe(true)
  })

  test('sessionCount getter 正确', () => {
    const store = useAssistantStore()
    expect(store.sessionCount).toBe(0)
    store.createSession()
    expect(store.sessionCount).toBe(1)
  })
})

describe('assistant store - API 配置', () => {
  test('setApiConfig 更新配置', () => {
    const store = useAssistantStore()
    store.setApiConfig({
      llmApiKey: 'sk-new',
      llmModel: 'deepseek-reasoner',
    })
    expect(store.apiConfig.llmApiKey).toBe('sk-new')
    expect(store.apiConfig.llmModel).toBe('deepseek-reasoner')
  })

  test('testApiConnectivity 成功', async () => {
    fetch.mockResolvedValue(mockLlmResponse('连接成功'))
    const store = useAssistantStore()
    store.setApiConfig({ llmApiKey: 'sk-test' })
    const result = await store.testApiConnectivity()
    expect(result.success).toBe(true)
  })

  test('testApiConnectivity 失败（无 Key）', async () => {
    const store = useAssistantStore()
    const result = await store.testApiConnectivity()
    expect(result.success).toBe(false)
  })
})

describe('assistant store - 会话管理', () => {
  test('createSession 创建新会话', () => {
    const store = useAssistantStore()
    const session = store.createSession()
    expect(session.id).toBeTruthy()
    expect(session.title).toBe('新对话')
    expect(session.messages).toEqual([])
    expect(store.currentSessionId).toBe(session.id)
    expect(store.sessionCount).toBe(1)
  })

  test('currentSession getter 返回当前会话', () => {
    const store = useAssistantStore()
    const session = store.createSession()
    expect(store.currentSession.id).toBe(session.id)
  })

  test('deleteSession 删除会话', () => {
    const store = useAssistantStore()
    const s1 = store.createSession()
    const s2 = store.createSession()
    store.deleteSession(s2.id)
    expect(store.sessionCount).toBe(1)
    expect(store.sessions[0].id).toBe(s1.id)
    expect(store.currentSessionId).toBe(s1.id)
  })

  test('clearAllSessions 清空所有会话', () => {
    const store = useAssistantStore()
    store.createSession()
    store.createSession()
    store.clearAllSessions()
    expect(store.sessionCount).toBe(0)
    expect(store.currentSessionId).toBeNull()
  })

  test('setCurrentSession 切换当前会话', () => {
    const store = useAssistantStore()
    const s1 = store.createSession()
    const s2 = store.createSession()
    store.setCurrentSession(s1.id)
    expect(store.currentSessionId).toBe(s1.id)
  })
})

describe('assistant store - 发送消息', () => {
  test('sendMessage 自动创建会话', async () => {
    fetch.mockResolvedValue(mockLlmResponse('回复内容'))
    const store = useAssistantStore()
    store.setApiConfig({ llmApiKey: 'sk-test' })
    await store.sendMessage('这段 MATLAB 代码报错了')
    expect(store.sessionCount).toBe(1)
    expect(store.currentSession.messages).toHaveLength(2)
    expect(store.currentSession.messages[0].role).toBe('user')
    expect(store.currentSession.messages[1].role).toBe('assistant')
  })

  test('sendMessage 首条消息更新标题', async () => {
    fetch.mockResolvedValue(mockLlmResponse('回复'))
    const store = useAssistantStore()
    store.setApiConfig({ llmApiKey: 'sk-test' })
    await store.sendMessage('这是一段很长的 MATLAB 代码问题描述文字')
    expect(store.currentSession.title).toContain('这是一段很长的')
  })

  test('sendMessage 记录路由信息', async () => {
    fetch.mockResolvedValue(mockLlmResponse('MATLAB 回复'))
    const store = useAssistantStore()
    store.setApiConfig({ llmApiKey: 'sk-test' })
    await store.sendMessage('MATLAB 仿真报错')
    const lastMsg = store.currentSession.messages[1]
    expect(lastMsg.routeInfo).toBeTruthy()
    expect(lastMsg.routeInfo.agentId).toBe('matlab')
  })

  test('sendMessage 错误时记录 error', async () => {
    const store = useAssistantStore()
    const result = await store.sendMessage('MATLAB 测试')
    const lastMsg = store.currentSession.messages[1]
    expect(lastMsg.error).toBeTruthy()
  })

  test('多次 sendMessage 追加到同一会话', async () => {
    fetch.mockResolvedValue(mockLlmResponse('回复'))
    const store = useAssistantStore()
    store.setApiConfig({ llmApiKey: 'sk-test' })
    await store.sendMessage('MATLAB 问题1')
    await store.sendMessage('MATLAB 问题2')
    expect(store.sessionCount).toBe(1)
    expect(store.currentSession.messages).toHaveLength(4)
  })
})

describe('assistant store - 导出导入', () => {
  test('getSessionsForExport 默认不含 API Key', () => {
    const store = useAssistantStore()
    store.setApiConfig({ llmApiKey: 'sk-secret', compileApiKey: 'compile-secret' })
    store.createSession()
    const data = store.getSessionsForExport(false)
    expect(data.apiConfig.llmApiKey).toBe('')
    expect(data.apiConfig.compileApiKey).toBe('')
    expect(data.sessions).toHaveLength(1)
  })

  test('getSessionsForExport 包含 API Key', () => {
    const store = useAssistantStore()
    store.setApiConfig({ llmApiKey: 'sk-secret' })
    store.createSession()
    const data = store.getSessionsForExport(true)
    expect(data.apiConfig.llmApiKey).toBe('sk-secret')
  })

  test('restoreFromImport 恢复数据', () => {
    const store = useAssistantStore()
    store.restoreFromImport({
      sessions: [{ id: 'test', title: '测试', messages: [] }],
      currentSessionId: 'test',
      apiConfig: { llmApiKey: 'sk-restored' },
    })
    expect(store.sessionCount).toBe(1)
    expect(store.currentSessionId).toBe('test')
    expect(store.apiConfig.llmApiKey).toBe('sk-restored')
  })
})