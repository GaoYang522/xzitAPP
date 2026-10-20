import { deepseekClient } from './deepseekClient.js'

const providers = {}

export function registerProvider(name, client) {
  providers[name] = client
}

registerProvider('deepseek', deepseekClient)

export function getProvider(name) {
  return providers[name]
}

export function getAvailableProviders() {
  return Object.keys(providers)
}

export async function chatWithLLM(messages, options = {}) {
  const {
    provider = 'deepseek',
    apiKey,
    baseUrl,
    model,
    temperature,
    maxTokens,
  } = options

  const client = providers[provider]
  if (!client) {
    return { error: 'UNKNOWN_PROVIDER', message: `未知的 LLM 提供商: ${provider}` }
  }

  return client.chatCompletion(messages, {
    apiKey,
    baseUrl,
    model,
    temperature,
    maxTokens,
  })
}

export async function testConnectivity(options = {}) {
  const result = await chatWithLLM(
    [{ role: 'user', content: '请回复"连接成功"四个字' }],
    { ...options, maxTokens: 50 }
  )
  if (result.error) {
    return { success: false, message: result.message }
  }
  return { success: true, message: result.content }
}