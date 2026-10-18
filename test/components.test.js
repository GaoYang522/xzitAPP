import { mount } from '@vue/test-utils'
import Btn from '../src/components/common/Btn.vue'
import Tag from '../src/components/common/Tag.vue'
import EmptyState from '../src/components/common/EmptyState.vue'
import SectionTitle from '../src/components/common/SectionTitle.vue'

describe('Btn 组件', () => {
  test('渲染按钮元素', () => {
    const wrapper = mount(Btn)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  test('渲染文字内容', () => {
    const wrapper = mount(Btn, { slots: { default: '点击我' } })
    expect(wrapper.text()).toContain('点击我')
  })

  test('danger variant 应用红色类', () => {
    const wrapper = mount(Btn, { props: { variant: 'danger' } })
    expect(wrapper.classes()).toContain('bg-red-500')
  })

  test('primary variant 应用渐变类', () => {
    const wrapper = mount(Btn, { props: { variant: 'primary' } })
    expect(wrapper.classes()).toContain('bg-grad-blue')
  })
})

describe('Tag 组件', () => {
  test('渲染标签内容', () => {
    const wrapper = mount(Tag, { slots: { default: '高优先' } })
    expect(wrapper.text()).toContain('高优先')
  })

  test('green color 应用绿色类', () => {
    const wrapper = mount(Tag, { props: { color: 'green' } })
    expect(wrapper.classes()).toContain('bg-green-100')
  })
})

describe('EmptyState 组件', () => {
  test('显示默认文案', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.text()).toContain('暂无数据')
  })

  test('显示自定义文案和图标', () => {
    const wrapper = mount(EmptyState, { props: { icon: '🎉', text: '完成了' } })
    expect(wrapper.text()).toContain('完成了')
    expect(wrapper.text()).toContain('🎉')
  })
})

describe('SectionTitle 组件', () => {
  test('显示标题文字', () => {
    const wrapper = mount(SectionTitle, { props: { title: '课表管理' } })
    expect(wrapper.text()).toContain('课表管理')
  })

  test('显示图标', () => {
    const wrapper = mount(SectionTitle, { props: { title: '课表', icon: '📚' } })
    expect(wrapper.text()).toContain('📚')
  })
})