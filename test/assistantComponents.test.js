import { mount } from '@vue/test-utils'
import { describe, test, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import CodeBlock from '../src/components/assistant/CodeBlock.vue'
import RouteIndicator from '../src/components/assistant/RouteIndicator.vue'
import ChatMessage from '../src/components/assistant/ChatMessage.vue'
import AgentList from '../src/components/assistant/AgentList.vue'
import AgentDetail from '../src/components/assistant/AgentDetail.vue'
import ApiConfig from '../src/components/assistant/ApiConfig.vue'
import HistoryList from '../src/components/assistant/HistoryList.vue'
import ChatInterface from '../src/components/assistant/ChatInterface.vue'
import Assistant from '../src/views/Assistant.vue'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('CodeBlock', () => {
  test('渲染代码内容', () => {
    const wrapper = mount(CodeBlock, { props: { code: 'print("hello")', language: 'python' } })
    expect(wrapper.text()).toContain('print("hello")')
  })

  test('显示语言标签', () => {
    const wrapper = mount(CodeBlock, { props: { code: 'x = 1', language: 'matlab' } })
    expect(wrapper.text()).toContain('matlab')
  })

  test('显示复制按钮', () => {
    const wrapper = mount(CodeBlock, { props: { code: 'x = 1' } })
    expect(wrapper.text()).toContain('复制')
  })

  test('canExecute 为 true 时显示执行按钮', () => {
    const wrapper = mount(CodeBlock, { props: { code: 'x = 1', canExecute: true } })
    expect(wrapper.text()).toContain('执行')
  })

  test('canExecute 为 false 时不显示执行按钮', () => {
    const wrapper = mount(CodeBlock, { props: { code: 'x = 1', canExecute: false } })
    expect(wrapper.text()).not.toContain('执行')
  })
})

describe('RouteIndicator', () => {
  test('显示路由到的 Agent 名称', () => {
    const wrapper = mount(RouteIndicator, { props: { agentName: 'MATLAB 助手', method: 'keyword' } })
    expect(wrapper.text()).toContain('MATLAB 助手')
  })

  test('显示关键词匹配方式', () => {
    const wrapper = mount(RouteIndicator, { props: { agentName: '测试', method: 'keyword' } })
    expect(wrapper.text()).toContain('关键词匹配')
  })

  test('显示 AI 分析方式', () => {
    const wrapper = mount(RouteIndicator, { props: { agentName: '测试', method: 'llm' } })
    expect(wrapper.text()).toContain('AI分析')
  })

  test('显示工作流步骤', () => {
    const wrapper = mount(RouteIndicator, {
      props: {
        steps: [{ agentName: 'MATLAB 助手' }, { agentName: '电路实验报告' }],
        method: 'llm',
      },
    })
    expect(wrapper.text()).toContain('MATLAB 助手')
    expect(wrapper.text()).toContain('电路实验报告')
  })
})

describe('ChatMessage', () => {
  test('用户消息右对齐', () => {
    const wrapper = mount(ChatMessage, {
      props: { message: { role: 'user', content: '你好' } },
    })
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.text()).toContain('你好')
  })

  test('AI 消息左对齐', () => {
    const wrapper = mount(ChatMessage, {
      props: { message: { role: 'assistant', content: '回复' } },
    })
    expect(wrapper.text()).toContain('回复')
  })

  test('显示路由信息', () => {
    const wrapper = mount(ChatMessage, {
      props: {
        message: {
          role: 'assistant',
          content: '回复',
          routeInfo: { method: 'keyword', agentId: 'matlab' },
          agentName: 'MATLAB 助手',
        },
      },
    })
    expect(wrapper.text()).toContain('MATLAB 助手')
  })

  test('电路报告消息显示导出按钮', () => {
    const wrapper = mount(ChatMessage, {
      props: {
        message: {
          role: 'assistant',
          content: '报告内容',
          agentId: 'circuit-report',
        },
      },
    })
    expect(wrapper.text()).toContain('导出 Word')
    expect(wrapper.text()).toContain('导出 PDF')
  })

  test('错误消息显示错误提示', () => {
    const wrapper = mount(ChatMessage, {
      props: {
        message: {
          role: 'assistant',
          content: '',
          error: 'MISSING_API_KEY',
          message: 'API Key 未配置',
        },
      },
    })
    expect(wrapper.text()).toContain('API Key 未配置')
  })
})

describe('AgentList', () => {
  test('渲染 3 个子 Agent', () => {
    const wrapper = mount(AgentList)
    expect(wrapper.text()).toContain('MATLAB 助手')
    expect(wrapper.text()).toContain('电路实验报告')
    expect(wrapper.text()).toContain('FPGA/单片机助手')
  })

  test('点击 Agent 触发 select 事件', async () => {
    const wrapper = mount(AgentList)
    const cards = wrapper.findAll('.cursor-pointer')
    expect(cards.length).toBe(4)
    await cards[0].trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
  })
})

describe('AgentDetail', () => {
  test('agent 为 null 时不渲染', () => {
    const wrapper = mount(AgentDetail, { props: { agent: null } })
    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  test('显示 Agent 详情', () => {
    const agent = {
      name: '测试 Agent',
      description: '测试描述',
      capabilities: ['能力1', '能力2'],
      systemPrompt: '测试 prompt',
    }
    const wrapper = mount(AgentDetail, { props: { agent } })
    expect(wrapper.text()).toContain('测试 Agent')
    expect(wrapper.text()).toContain('测试描述')
    expect(wrapper.text()).toContain('能力1')
  })
})

describe('ApiConfig', () => {
  test('渲染 LLM API 配置表单', () => {
    const wrapper = mount(ApiConfig)
    expect(wrapper.text()).toContain('LLM API 配置')
    expect(wrapper.text()).toContain('API Key')
    expect(wrapper.text()).toContain('测试连通性')
  })

  test('渲染在线编译 API 配置', () => {
    const wrapper = mount(ApiConfig)
    expect(wrapper.text()).toContain('在线编译 API 配置')
  })
})

describe('HistoryList', () => {
  test('无历史时显示空状态', () => {
    const wrapper = mount(HistoryList)
    expect(wrapper.text()).toContain('暂无对话历史')
  })
})

describe('ChatInterface', () => {
  test('渲染输入框和发送按钮', () => {
    const wrapper = mount(ChatInterface)
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.text()).toContain('新对话')
  })

  test('空会话显示欢迎提示', () => {
    const wrapper = mount(ChatInterface)
    expect(wrapper.text()).toContain('开始与 AI 助手对话')
  })
})

describe('Assistant 页面', () => {
  test('渲染 4 个 Tab', () => {
    const wrapper = mount(Assistant)
    expect(wrapper.text()).toContain('对话')
    expect(wrapper.text()).toContain('Agent 列表')
    expect(wrapper.text()).toContain('API 配置')
    expect(wrapper.text()).toContain('历史')
  })

  test('默认显示对话 Tab', () => {
    const wrapper = mount(Assistant)
    expect(wrapper.text()).toContain('AI 对话')
  })
})