import { mount } from '@vue/test-utils'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import AiChatWidget from '../src/components/home/AiChatWidget.vue'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('AiChatWidget', () => {
  test('渲染 AI 助手标题', () => {
    const wrapper = mount(AiChatWidget, {
      global: { stubs: { 'router-link': true, 'router-view': true } },
    })
    expect(wrapper.text()).toContain('AI 助手')
  })

  test('渲染输入框', () => {
    const wrapper = mount(AiChatWidget, {
      global: { stubs: { 'router-link': true, 'router-view': true } },
    })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  test('渲染发送按钮', () => {
    const wrapper = mount(AiChatWidget, {
      global: { stubs: { 'router-link': true, 'router-view': true } },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  test('显示展开完整对话链接', () => {
    const wrapper = mount(AiChatWidget, {
      global: { stubs: { 'router-link': true, 'router-view': true } },
    })
    expect(wrapper.text()).toContain('展开完整对话')
  })

  test('无消息时显示欢迎提示', () => {
    const wrapper = mount(AiChatWidget, {
      global: { stubs: { 'router-link': true, 'router-view': true } },
    })
    expect(wrapper.text()).toContain('输入问题')
  })
})