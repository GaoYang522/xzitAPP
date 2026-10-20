import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { chatCompletion, deepseekClient } from '../src/utils/deepseekClient.js'
import { chatWithLLM, testConnectivity, registerProvider, getProvider, getAvailableProviders } from '../src/utils/llmProvider.js'

function mockFetchResponse(body, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('deepseekClient.chatCompletion', () => {
  test('正常请求返回 content 和 usage', async () => {
    fetch.mockResolvedValue(mockFetchResponse({
      choices: [{ message: { content: '你好' } }],
      usage: { total_tokens: 10 },
    }))

    const result = await chatCompletion(
      [{ role: 'user', content: '你好' }],
      { apiKey: 'sk-test' }
    )

    expect(result.content).toBe('你好')
    expect(result.usage.total_tokens).toBe(10)
    expect(fetch).toHaveBeenCalledOnce()
  })

  test('请求体包含正确的 model 和 messages', async () => {
    fetch.mockResolvedValue(mockFetchResponse({
      choices: [{ message: { content: 'ok' } }],
    }))

    await chatCompletion(
      [{ role: 'system', content: '你是助手' }, { role: 'user', content: '测试' }],
      { apiKey: 'sk-test', model: 'deepseek-reasoner', temperature: 0.1 }
    )

    const callBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(callBody.model).toBe('deepseek-reasoner')
    expect(callBody.temperature).toBe(0.1)
    expect(callBody.messages).toHaveLength(2)
    expect(callBody.messages[0].role).toBe('system')
  })

  test('API Key 缺失返回 MISSING_API_KEY 错误', async () => {
    const result = await chatCompletion([{ role: 'user', content: 'test' }], {})
    expect(result.error).toBe('MISSING_API_KEY')
    expect(result.message).toContain('API Key')
    expect(fetch).not.toHaveBeenCalled()
  })

  test('401 返回 INVALID_API_KEY 错误', async () => {
    fetch.mockResolvedValue(mockFetchResponse({ error: 'invalid key' }, 401))
    const result = await chatCompletion([{ role: 'user', content: 'test' }], { apiKey: 'bad' })
    expect(result.error).toBe('INVALID_API_KEY')
  })

  test('429 返回 RATE_LIMIT 错误', async () => {
    fetch.mockResolvedValue(mockFetchResponse({ error: 'too many' }, 429))
    const result = await chatCompletion([{ role: 'user', content: 'test' }], { apiKey: 'sk-test' })
    expect(result.error).toBe('RATE_LIMIT')
  })

  test('网络错误返回 NETWORK_ERROR', async () => {
    fetch.mockRejectedValue(new Error('connection refused'))
    const result = await chatCompletion([{ role: 'user', content: 'test' }], { apiKey: 'sk-test' })
    expect(result.error).toBe('NETWORK_ERROR')
    expect(result.message).toContain('connection refused')
  })

  test('JSON 解析失败返回 PARSE_ERROR', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('invalid json')),
      text: () => Promise.resolve('not json'),
    })
    const result = await chatCompletion([{ role: 'user', content: 'test' }], { apiKey: 'sk-test' })
    expect(result.error).toBe('PARSE_ERROR')
  })

  test('自定义 baseUrl 正确拼接', async () => {
    fetch.mockResolvedValue(mockFetchResponse({
      choices: [{ message: { content: 'ok' } }],
    }))
    await chatCompletion([{ role: 'user', content: 'test' }], {
      apiKey: 'sk-test',
      baseUrl: 'https://custom.api.com/',
    })
    expect(fetch.mock.calls[0][0]).toBe('https://custom.api.com/v1/chat/completions')
  })
})

describe('llmProvider', () => {
  test('默认注册了 deepseek 提供商', () => {
    expect(getAvailableProviders()).toContain('deepseek')
    expect(getProvider('deepseek')).toBe(deepseekClient)
  })

  test('chatWithLLM 调用 deepseek 提供商', async () => {
    fetch.mockResolvedValue(mockFetchResponse({
      choices: [{ message: { content: '回复' } }],
    }))
    const result = await chatWithLLM(
      [{ role: 'user', content: '测试' }],
      { apiKey: 'sk-test' }
    )
    expect(result.content).toBe('回复')
  })

  test('未知提供商返回 UNKNOWN_PROVIDER 错误', async () => {
    const result = await chatWithLLM(
      [{ role: 'user', content: 'test' }],
      { provider: 'unknown', apiKey: 'sk-test' }
    )
    expect(result.error).toBe('UNKNOWN_PROVIDER')
  })

  test('testConnectivity 成功时返回 success=true', async () => {
    fetch.mockResolvedValue(mockFetchResponse({
      choices: [{ message: { content: '连接成功' } }],
    }))
    const result = await testConnectivity({ apiKey: 'sk-test' })
    expect(result.success).toBe(true)
    expect(result.message).toBe('连接成功')
  })

  test('testConnectivity 失败时返回 success=false', async () => {
    const result = await testConnectivity({})
    expect(result.success).toBe(false)
  })

  test('registerProvider 可注册新提供商', async () => {
    const mockClient = {
      chatCompletion: vi.fn().mockResolvedValue({ content: 'mock reply' }),
    }
    registerProvider('mock-provider', mockClient)
    const result = await chatWithLLM(
      [{ role: 'user', content: 'test' }],
      { provider: 'mock-provider', apiKey: 'sk-test' }
    )
    expect(result.content).toBe('mock reply')
    expect(mockClient.chatCompletion).toHaveBeenCalledOnce()
  })
})