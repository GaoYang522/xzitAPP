const DEFAULT_BASE_URL = 'https://api.deepseek.com'
const DEFAULT_MODEL = 'deepseek-chat'

export async function chatCompletion(messages, options = {}) {
  const {
    apiKey,
    baseUrl = DEFAULT_BASE_URL,
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 4096,
  } = options

  if (!apiKey) {
    return { error: 'MISSING_API_KEY', message: 'API Key 未配置，请在「我的助手」模块设置 API Key' }
  }

  const url = `${baseUrl.replace(/\/$/, '')}/v1/chat/completions`
  const body = {
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature,
    max_tokens: maxTokens,
  }

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
  } catch (e) {
    return { error: 'NETWORK_ERROR', message: `网络请求失败: ${e.message}` }
  }

  if (response.status === 401) {
    return { error: 'INVALID_API_KEY', message: 'API Key 无效，请检查配置' }
  }
  if (response.status === 429) {
    return { error: 'RATE_LIMIT', message: '请求过于频繁，请稍后重试' }
  }
  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    return { error: 'API_ERROR', message: `API 返回错误 ${response.status}: ${errText}` }
  }

  let data
  try {
    data = await response.json()
  } catch (e) {
    return { error: 'PARSE_ERROR', message: `JSON 解析失败: ${e.message}` }
  }

  const content = data.choices?.[0]?.message?.content || ''
  const usage = data.usage || null

  return { content, usage }
}

export const deepseekClient = {
  chatCompletion,
  defaultBaseUrl: DEFAULT_BASE_URL,
  defaultModel: DEFAULT_MODEL,
}