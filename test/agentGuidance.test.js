import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { checkDataCompleteness, routeToAgent, handleMessage } from '../src/agents/mainAgent.js'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('checkDataCompleteness', () => {
  test('MATLAB缺少代码返回引导', () => {
    const result = checkDataCompleteness('matlab', '帮我调试代码')
    expect(result).not.toBeNull()
    expect(result.content).toContain('粘贴')
  })

  test('MATLAB有代码返回null', () => {
    const result = checkDataCompleteness('matlab', '帮我调试这段代码\n```matlab\nx = 1\n```')
    expect(result).toBeNull()
  })

  test('MATLAB优化缺少代码返回引导', () => {
    const result = checkDataCompleteness('matlab', '帮我优化')
    expect(result).not.toBeNull()
    expect(result.content).toContain('代码')
  })

  test('电路报告缺少数据返回引导', () => {
    const result = checkDataCompleteness('circuit-report', '帮我生成报告')
    expect(result).not.toBeNull()
    expect(result.content).toContain('实验名称')
    expect(result.content).toContain('测量数据')
  })

  test('电路报告有数据返回null', () => {
    const result = checkDataCompleteness('circuit-report', '帮我生成电路实验报告，测量数据：电压5V，电流0.5A')
    expect(result).toBeNull()
  })

  test('FPGA缺少功能描述返回引导', () => {
    const result = checkDataCompleteness('fpga', '帮我写代码')
    expect(result).not.toBeNull()
    expect(result.content).toContain('功能')
  })

  test('FPGA有功能描述返回null', () => {
    const result = checkDataCompleteness('fpga', '帮我生成一个4位二进制计数器的Verilog代码')
    expect(result).toBeNull()
  })

  test('chat Agent返回null', () => {
    expect(checkDataCompleteness('chat', '你好')).toBeNull()
  })

  test('未知Agent返回null', () => {
    expect(checkDataCompleteness('unknown', 'test')).toBeNull()
  })
})

describe('routeToAgent 预检拦截', () => {
  test('MATLAB缺少代码时不调用LLM', async () => {
    const result = await routeToAgent('matlab', '帮我调试代码', {}, { apiKey: 'sk-test' })
    expect(result.content).toContain('粘贴')
    expect(fetch).not.toHaveBeenCalled()
  })

  test('电路报告缺少数据时不调用LLM', async () => {
    const result = await routeToAgent('circuit-report', '生成报告', {}, { apiKey: 'sk-test' })
    expect(result.content).toContain('实验名称')
    expect(fetch).not.toHaveBeenCalled()
  })

  test('FPGA缺少功能时不调用LLM', async () => {
    const result = await routeToAgent('fpga', '帮我写代码', {}, { apiKey: 'sk-test' })
    expect(result.content).toContain('功能')
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('handleMessage 引导拦截', () => {
  test('MATLAB关键词匹配但缺少代码时返回引导', async () => {
    const result = await handleMessage('帮我调试matlab代码', { apiKey: 'sk-test' })
    expect(result.content).toContain('粘贴')
    expect(fetch).not.toHaveBeenCalled()
  })

  test('电路报告关键词匹配但缺少数据时返回引导', async () => {
    const result = await handleMessage('帮我生成实验报告', { apiKey: 'sk-test' })
    expect(result.content).toContain('实验名称')
    expect(fetch).not.toHaveBeenCalled()
  })
})