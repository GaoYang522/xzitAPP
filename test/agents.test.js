import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { SUB_AGENTS, getAgentById, getAgentIds } from '../src/agents/agentConfig.js'
import { keywordRoute, analyzeIntent, routeToAgent, executeWorkflow, handleMessage } from '../src/agents/mainAgent.js'
import { handle as matlabHandle, executeCode as matlabExecCode } from '../src/agents/matlabAgent.js'
import { handle as circuitHandle, exportReport } from '../src/agents/circuitReportAgent.js'
import { handle as fpgaHandle, checkVerilogCode } from '../src/agents/fpgaAgent.js'

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

describe('agentConfig', () => {
  test('有 4 个子 Agent', () => {
    expect(SUB_AGENTS).toHaveLength(4)
  })

  test('每个子 Agent 有必需字段', () => {
    for (const agent of SUB_AGENTS) {
      expect(agent.id).toBeTruthy()
      expect(agent.name).toBeTruthy()
      expect(agent.shortName).toBeTruthy()
      expect(agent.description).toBeTruthy()
      expect(agent.systemPrompt).toBeTruthy()
      expect(agent.capabilities.length).toBeGreaterThan(0)
    }
  })

  test('getAgentById 正确返回', () => {
    expect(getAgentById('matlab').id).toBe('matlab')
    expect(getAgentById('circuit-report').id).toBe('circuit-report')
    expect(getAgentById('fpga').id).toBe('fpga')
    expect(getAgentById('nonexistent')).toBeNull()
  })

  test('getAgentIds 返回所有 ID', () => {
    expect(getAgentIds()).toEqual(['matlab', 'circuit-report', 'fpga', 'chat'])
  })
})

describe('keywordRoute', () => {
  test('MATLAB 关键词匹配', () => {
    expect(keywordRoute('这段 MATLAB 代码报错了').agentId).toBe('matlab')
    expect(keywordRoute('帮我画个 plot 图').agentId).toBe('matlab')
    expect(keywordRoute('FFT 变换怎么写').agentId).toBe('matlab')
  })

  test('电路实验报告关键词匹配', () => {
    expect(keywordRoute('帮我生成电路实验报告').agentId).toBe('circuit-report')
    expect(keywordRoute('测量数据误差分析').agentId).toBe('circuit-report')
  })

  test('FPGA 关键词匹配', () => {
    expect(keywordRoute('帮我写一段 Verilog 代码').agentId).toBe('fpga')
    expect(keywordRoute('STM32 GPIO 配置').agentId).toBe('fpga')
    expect(keywordRoute('单片机中断处理').agentId).toBe('fpga')
  })

  test('无匹配返回 null', () => {
    expect(keywordRoute('今天天气怎么样')).toBeNull()
  })

  test('多关键词得分更高', () => {
    const result = keywordRoute('MATLAB 仿真报错了，矩阵运算有问题')
    expect(result.agentId).toBe('matlab')
    expect(result.confidence).toBe('high')
  })
})

describe('analyzeIntent', () => {
  test('LLM 返回单 Agent 路由', async () => {
    fetch.mockResolvedValue(mockLlmResponse('{"type": "single", "agentId": "matlab"}'))
    const result = await analyzeIntent('帮我分析代码', { apiKey: 'sk-test' })
    expect(result.type).toBe('single')
    expect(result.agentId).toBe('matlab')
  })

  test('LLM 返回工作流路由', async () => {
    fetch.mockResolvedValue(mockLlmResponse('{"type": "workflow", "steps": ["matlab", "circuit-report"]}'))
    const result = await analyzeIntent('分析代码并生成报告', { apiKey: 'sk-test' })
    expect(result.type).toBe('workflow')
    expect(result.steps).toEqual(['matlab', 'circuit-report'])
  })

  test('LLM 返回 unclear', async () => {
    fetch.mockResolvedValue(mockLlmResponse('{"type": "unclear"}'))
    const result = await analyzeIntent('随便说点什么', { apiKey: 'sk-test' })
    expect(result.type).toBe('unclear')
  })

  test('LLM 返回无效 agentId 时回退 unclear', async () => {
    fetch.mockResolvedValue(mockLlmResponse('{"type": "single", "agentId": "nonexistent"}'))
    const result = await analyzeIntent('test', { apiKey: 'sk-test' })
    expect(result.type).toBe('unclear')
  })

  test('LLM 返回带 markdown 包裹的 JSON', async () => {
    fetch.mockResolvedValue(mockLlmResponse('```json\n{"type": "single", "agentId": "fpga"}\n```'))
    const result = await analyzeIntent('test', { apiKey: 'sk-test' })
    expect(result.type).toBe('single')
    expect(result.agentId).toBe('fpga')
  })
})

describe('routeToAgent', () => {
  test('路由到 matlab agent', async () => {
    fetch.mockResolvedValue(mockLlmResponse('MATLAB 代码分析结果'))
    const result = await routeToAgent('matlab', '分析这段代码', {}, { apiKey: 'sk-test' })
    expect(result.content).toBe('MATLAB 代码分析结果')
    expect(result.agentId).toBe('matlab')
  })

  test('路由到 circuit-report agent', async () => {
    fetch.mockResolvedValue(mockLlmResponse('实验报告内容'))
    const result = await routeToAgent('circuit-report', '帮我生成电路实验报告，实验名称：基尔霍夫定律，测量数据：电压5V电流0.5A', {}, { apiKey: 'sk-test' })
    expect(result.content).toBe('实验报告内容')
    expect(result.agentId).toBe('circuit-report')
    expect(result.canExport).toBe(true)
  })

  test('路由到 fpga agent', async () => {
    fetch.mockResolvedValue(mockLlmResponse('Verilog 代码'))
    const result = await routeToAgent('fpga', '写个 Verilog', {}, { apiKey: 'sk-test' })
    expect(result.content).toBe('Verilog 代码')
    expect(result.agentId).toBe('fpga')
  })

  test('未知 agent 返回错误', async () => {
    const result = await routeToAgent('unknown', 'test', {}, { apiKey: 'sk-test' })
    expect(result.error).toBe('UNKNOWN_AGENT')
  })
})

describe('executeWorkflow', () => {
  test('两步串联执行', async () => {
    fetch
      .mockResolvedValueOnce(mockLlmResponse('代码分析结果'))
      .mockResolvedValueOnce(mockLlmResponse('基于分析的报告'))
    const result = await executeWorkflow(['matlab', 'circuit-report'], '分析代码并生成报告，实验名称：基尔霍夫定律，测量数据：电压5V电流0.5A', { apiKey: 'sk-test' })
    expect(result.type).toBe('workflow')
    expect(result.steps).toHaveLength(2)
    expect(result.steps[0].agentId).toBe('matlab')
    expect(result.steps[1].agentId).toBe('circuit-report')
    expect(result.content).toContain('代码分析结果')
    expect(result.content).toContain('基于分析的报告')
  })

  test('单步工作流', async () => {
    fetch.mockResolvedValue(mockLlmResponse('结果'))
    const result = await executeWorkflow(['fpga'], '写代码', { apiKey: 'sk-test' })
    expect(result.steps).toHaveLength(1)
  })
})

describe('handleMessage', () => {
  test('关键词匹配直接路由不走 LLM 分析', async () => {
    fetch.mockResolvedValue(mockLlmResponse('MATLAB 回复'))
    const result = await handleMessage('这段 MATLAB 代码报错了', { apiKey: 'sk-test' })
    expect(result.type).toBe('single')
    expect(result.agentId).toBe('matlab')
    expect(result.routeInfo.method).toBe('keyword')
  })

  test('无关键词匹配时走 LLM 分析', async () => {
    fetch
      .mockResolvedValueOnce(mockLlmResponse('{"type": "single", "agentId": "circuit-report"}'))
      .mockResolvedValueOnce(mockLlmResponse('报告内容'))
    const result = await handleMessage('帮我处理这个实验数据', { apiKey: 'sk-test' })
    expect(result.type).toBe('single')
    expect(result.agentId).toBe('circuit-report')
    expect(result.routeInfo.method).toBe('llm')
  })

  test('LLM 返回 workflow 时执行工作流', async () => {
    fetch
      .mockResolvedValueOnce(mockLlmResponse('{"type": "workflow", "steps": ["matlab", "circuit-report"]}'))
      .mockResolvedValueOnce(mockLlmResponse('分析结果'))
      .mockResolvedValueOnce(mockLlmResponse('报告结果'))
    const result = await handleMessage('分析并生成报告', { apiKey: 'sk-test' })
    expect(result.type).toBe('workflow')
    expect(result.steps).toHaveLength(2)
  })

  test('unclear 时路由到 chat Agent', async () => {
    fetch
      .mockResolvedValueOnce(mockLlmResponse('{"type": "unclear"}'))
      .mockResolvedValueOnce(mockLlmResponse('你好！有什么可以帮你的？'))
    const result = await handleMessage('今天天气怎么样', { apiKey: 'sk-test' })
    expect(result.type).toBe('single')
    expect(result.agentId).toBe('chat')
    expect(result.routeInfo.method).toBe('fallback')
  })
})

describe('子 Agent handle 函数', () => {
  test('matlabAgent.handle 传入正确的 system prompt', async () => {
    fetch.mockResolvedValue(mockLlmResponse('回复'))
    await matlabHandle('测试', {}, { apiKey: 'sk-test' })
    const callBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(callBody.messages[0].role).toBe('system')
    expect(callBody.messages[0].content).toContain('MATLAB')
  })

  test('circuitReportAgent.handle 传入正确的 system prompt', async () => {
    fetch.mockResolvedValue(mockLlmResponse('回复'))
    await circuitHandle('测试', {}, { apiKey: 'sk-test' })
    const callBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(callBody.messages[0].content).toContain('电路实验报告')
  })

  test('fpgaAgent.handle 传入正确的 system prompt', async () => {
    fetch.mockResolvedValue(mockLlmResponse('回复'))
    await fpgaHandle('测试', {}, { apiKey: 'sk-test' })
    const callBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(callBody.messages[0].content).toContain('FPGA')
  })

  test('context.previousResult 传入上下文', async () => {
    fetch.mockResolvedValue(mockLlmResponse('回复'))
    await matlabHandle('继续分析', { previousResult: '之前的结果' }, { apiKey: 'sk-test' })
    const callBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(callBody.messages[1].content).toContain('之前的结果')
  })
})

describe('fpgaAgent.checkVerilogCode', () => {
  test('合法 Verilog 返回 valid', () => {
    const result = checkVerilogCode('module test(input a, output b); assign b = a; endmodule')
    expect(result.valid).toBe(true)
  })

  test('非法 Verilog 返回错误', () => {
    const result = checkVerilogCode('assign b = a;')
    expect(result.valid).toBe(false)
  })
})