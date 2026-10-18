import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Club from '../src/views/Club.vue'
import ClubManager from '../src/components/club/ClubManager.vue'
import ActivityManager from '../src/components/club/ActivityManager.vue'
import PostManager from '../src/components/club/PostManager.vue'
import { useClubStore } from '../src/stores/club'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('Club 页面', () => {
  test('渲染 3 个标签', () => {
    const wrapper = mount(Club)
    expect(wrapper.text()).toContain('社团')
    expect(wrapper.text()).toContain('活动')
    expect(wrapper.text()).toContain('动态')
  })

  test('默认显示社团管理', () => {
    const wrapper = mount(Club)
    expect(wrapper.findComponent(ClubManager).exists()).toBe(true)
  })
})

describe('ClubManager 社团管理', () => {
  test('空状态', () => {
    const wrapper = mount(ClubManager)
    expect(wrapper.text()).toContain('还没有加入社团')
  })

  test('显示社团', () => {
    const store = useClubStore()
    store.addClub({ name: '编程社', role: '部长' })
    const wrapper = mount(ClubManager)
    expect(wrapper.text()).toContain('编程社')
  })
})

describe('ActivityManager 活动管理', () => {
  test('空状态', () => {
    const wrapper = mount(ActivityManager)
    expect(wrapper.text()).toContain('没有社团活动')
  })

  test('显示活动和报名状态', () => {
    const store = useClubStore()
    store.addActivity({ name: '招新', clubName: '编程社', date: '2026-12-01', status: 'registered' })
    const wrapper = mount(ActivityManager)
    expect(wrapper.text()).toContain('招新')
    expect(wrapper.text()).toContain('已报名')
  })
})

describe('PostManager 校园动态', () => {
  test('空状态', () => {
    const wrapper = mount(PostManager)
    expect(wrapper.text()).toContain('还没有动态')
  })

  test('显示帖子', () => {
    const store = useClubStore()
    store.addPost({ title: '大家好', content: '新人报道', tags: '分享', time: '2026-10-16 12:00' })
    const wrapper = mount(PostManager)
    expect(wrapper.text()).toContain('大家好')
    expect(wrapper.text()).toContain('新人报道')
  })
})