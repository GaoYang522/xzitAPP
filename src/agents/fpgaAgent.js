import { chatWithLLM } from '../utils/llmProvider.js'
import { executeC, checkVerilog } from '../utils/codeExecutor.js'
import { getAgentById } from './agentConfig.js'

export async function handle(userInput, context = {}, options = {}) {
  const agent = getAgentById('fpga')
  const messages = [
    { role: 'system', content: agent.systemPrompt },
  ]

  if (context.previousResult) {
    messages.push({ role: 'user', content: `之前的分析结果：\n${context.previousResult}` })
    messages.push({ role: 'user', content: `基于以上背景，请处理以下请求：\n${userInput}` })
  } else {
    messages.push({ role: 'user', content: userInput })
  }

  const result = await chatWithLLM(messages, options)
  if (result.error) {
    return { error: result.error, message: result.message }
  }

  return {
    content: result.content,
    agentId: 'fpga',
    agentName: agent.shortName,
  }
}

export async function executeCCode(cCode, options = {}) {
  return executeC(cCode, {
    apiUrl: options.compileApiUrl,
    apiKey: options.compileApiKey,
  })
}

export function checkVerilogCode(verilogCode) {
  return checkVerilog(verilogCode)
}