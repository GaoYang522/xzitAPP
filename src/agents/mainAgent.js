import { chatWithLLM } from '../utils/llmProvider.js'
import { SUB_AGENTS, getAgentById } from './agentConfig.js'
import { handle as matlabHandle } from './matlabAgent.js'
import { handle as circuitReportHandle } from './circuitReportAgent.js'
import { handle as fpgaHandle } from './fpgaAgent.js'
import { handle as chatHandle } from './chatAgent.js'

const KEYWORD_MAP = {
  matlab: ['matlab', '报错', '矩阵', '仿真', '绘图', 'plot', 'fft', '滤波', '信号处理', '控制系统', '传递函数', 'bode', 'step', 'impulse'],
  'circuit-report': ['实验报告', '电路', '测量', '误差', '放大倍数', '频率响应', '阻抗', '运放', '滤波器', '谐振', '数据表格', '实验结论'],
  fpga: ['verilog', 'vhdl', 'fpga', '单片机', 'stm32', 'gpio', 'uart', 'adc', 'pwm', '中断', '寄存器', '状态机', 'always', 'assign', 'module'],
}

export function keywordRoute(input) {
  const lower = input.toLowerCase()
  const scores = {}

  for (const [agentId, keywords] of Object.entries(KEYWORD_MAP)) {
    scores[agentId] = 0
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        scores[agentId]++
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) return null

  const maxAgents = Object.entries(scores)
    .filter(([, s]) => s === maxScore)
    .map(([id]) => id)

  if (maxAgents.length === 1) {
    return { agentId: maxAgents[0], confidence: 'high', method: 'keyword' }
  }
  return null
}

const ROUTER_SYSTEM_PROMPT = `你是一个意图分析路由器。根据用户的输入，判断应该路由到哪个子 Agent 处理。

可用的子 Agent：
1. matlab - MATLAB 代码调试、优化、解释、执行（关键词：MATLAB、矩阵、仿真、绘图、信号处理）
2. circuit-report - 电路实验报告生成（关键词：实验报告、电路、测量、误差、数据分析）
3. fpga - FPGA/单片机代码生成和审查（关键词：Verilog、VHDL、FPGA、单片机、STM32、GPIO）
4. chat - 日常聊天、查询课表/待办/成绩、创建待办、常识问题（关键词：今天、课表、待办、考试、成绩、帮我记、聊天）

请返回 JSON 格式：
- 单 Agent 路由：{"type": "single", "agentId": "matlab"}
- 多 Agent 串联：{"type": "workflow", "steps": ["matlab", "circuit-report"]}
- 无法确定：{"type": "unclear"}

只返回 JSON，不要其他文字。`

export async function analyzeIntent(userInput, options = {}) {
  const messages = [
    { role: 'system', content: ROUTER_SYSTEM_PROMPT },
    { role: 'user', content: userInput },
  ]

  const result = await chatWithLLM(messages, { ...options, maxTokens: 200, temperature: 0.1 })
  if (result.error) {
    return { error: result.error, message: result.message }
  }

  let parsed
  try {
    const jsonStr = result.content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '')
    parsed = JSON.parse(jsonStr)
  } catch (e) {
    return { error: 'PARSE_ERROR', message: `路由结果解析失败: ${e.message}`, raw: result.content }
  }

  if (parsed.type === 'single' && getAgentById(parsed.agentId)) {
    return { type: 'single', agentId: parsed.agentId, confidence: 'medium', method: 'llm' }
  }
  if (parsed.type === 'workflow' && Array.isArray(parsed.steps)) {
    const validSteps = parsed.steps.filter((s) => getAgentById(s))
    if (validSteps.length > 0) {
      return { type: 'workflow', steps: validSteps, confidence: 'medium', method: 'llm' }
    }
  }
  if (parsed.type === 'unclear') {
    return { type: 'unclear', confidence: 'low', method: 'llm' }
  }

  return { type: 'unclear', confidence: 'low', method: 'llm' }
}

const AGENT_HANDLERS = {
  matlab: matlabHandle,
  'circuit-report': circuitReportHandle,
  fpga: fpgaHandle,
  chat: chatHandle,
}

export async function routeToAgent(agentId, userInput, context = {}, options = {}) {
  const handler = AGENT_HANDLERS[agentId]
  if (!handler) {
    return { error: 'UNKNOWN_AGENT', message: `未知的子 Agent: ${agentId}` }
  }
  const completenessCheck = checkDataCompleteness(agentId, userInput)
  if (completenessCheck) {
    return completenessCheck
  }
  return handler(userInput, context, options)
}

export function checkDataCompleteness(agentId, userInput) {
  const input = userInput.trim()
  const hasCodeBlock = input.includes('```') || /\b(function|module|void|int|always|assign)\b/.test(input)

  if (agentId === 'matlab') {
    if (/调试|报错|修复|优化/.test(input) && input.length < 30 && !hasCodeBlock) {
      return { content: '请粘贴你的 MATLAB 代码，这样我才能帮你分析。' }
    }
  }

  if (agentId === 'circuit-report') {
    if (/报告|生成报告/.test(input) && input.length < 20) {
      return { content: '请提供以下信息以便生成实验报告：\n1. 实验名称\n2. 实验测量数据（如电压、电流、电阻等）\n3. 实验目的（可选）' }
    }
  }

  if (agentId === 'fpga') {
    if (/生成|写代码|帮我写/.test(input) && input.length < 20) {
      return { content: '请描述你需要实现的具体功能，例如：\n- 生成一个 4 位二进制计数器的 Verilog 代码\n- 生成 STM32 串口通信的 C 代码' }
    }
  }

  return null
}

export async function executeWorkflow(steps, userInput, options = {}, context = {}) {
  const results = []
  let previousResult = null

  for (let i = 0; i < steps.length; i++) {
    const agentId = steps[i]
    const stepContext = { ...context }
    if (previousResult) stepContext.previousResult = previousResult
    const result = await routeToAgent(agentId, userInput, stepContext, options)

    if (result.error) {
      results.push({ step: i + 1, agentId, error: result.error, message: result.message })
      break
    }

    results.push({
      step: i + 1,
      agentId,
      agentName: getAgentById(agentId)?.shortName || agentId,
      content: result.content,
    })
    previousResult = result.content
  }

  return {
    type: 'workflow',
    steps: results,
    content: results.map((r) => `【步骤${r.step}】${r.agentName || r.agentId}\n${r.content || r.message || ''}`).join('\n\n---\n\n'),
  }
}

export async function handleMessage(userInput, options = {}, context = {}) {
  const kwResult = keywordRoute(userInput)
  if (kwResult) {
    const result = await routeToAgent(kwResult.agentId, userInput, context, options)
    if (result.error) {
      return { error: result.error, message: result.message }
    }
    return {
      type: 'single',
      agentId: kwResult.agentId,
      agentName: getAgentById(kwResult.agentId)?.shortName,
      content: result.content,
      routeInfo: { method: 'keyword', agentId: kwResult.agentId },
      createdTodos: result.createdTodos,
    }
  }

  const intentResult = await analyzeIntent(userInput, options)
  if (intentResult.error) {
    return { error: intentResult.error, message: intentResult.message }
  }

  if (intentResult.type === 'single') {
    const result = await routeToAgent(intentResult.agentId, userInput, context, options)
    if (result.error) {
      return { error: result.error, message: result.message }
    }
    return {
      type: 'single',
      agentId: intentResult.agentId,
      agentName: getAgentById(intentResult.agentId)?.shortName,
      content: result.content,
      routeInfo: { method: 'llm', agentId: intentResult.agentId },
      createdTodos: result.createdTodos,
    }
  }

  if (intentResult.type === 'workflow') {
    const result = await executeWorkflow(intentResult.steps, userInput, options, context)
    return {
      type: 'workflow',
      steps: result.steps,
      content: result.content,
      routeInfo: { method: 'llm', steps: intentResult.steps },
    }
  }

  const chatResult = await routeToAgent('chat', userInput, context, options)
  if (chatResult.error) {
    return { error: chatResult.error, message: chatResult.message }
  }
  return {
    type: 'single',
    agentId: 'chat',
    agentName: getAgentById('chat')?.shortName,
    content: chatResult.content,
    routeInfo: { method: 'fallback', agentId: 'chat' },
    createdTodos: chatResult.createdTodos,
  }
}