import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Life from '../src/views/Life.vue'
import CardWallet from '../src/components/life/CardWallet.vue'
import CanteenManager from '../src/components/life/CanteenManager.vue'
import PlaceManager from '../src/components/life/PlaceManager.vue'
import PackageManager from '../src/components/life/PackageManager.vue'
import { useLifeStore } from '../src/stores/life'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('Life 页面', () => {
  test('渲染 4 个标签', () => {
    const wrapper = mount(Life)
    expect(wrapper.text()).toContain('一卡通')
    expect(wrapper.text()).toContain('食堂')
    expect(wrapper.text()).toContain('地点')
    expect(wrapper.text()).toContain('快递')
  })

  test('默认显示一卡通', () => {
    const wrapper = mount(Life)
    expect(wrapper.findComponent(CardWallet).exists()).toBe(true)
  })
})

describe('CardWallet 一卡通', () => {
  test('显示余额', () => {
    const wrapper = mount(CardWallet)
    expect(wrapper.text()).toContain('余额')
  })

  test('消费记录显示', () => {
    const store = useLifeStore()
    store.addCardRecord({ type: 'expense', amount: 15, location: '食堂', date: '2026-10-16' })
    const wrapper = mount(CardWallet)
    expect(wrapper.text()).toContain('15')
    expect(wrapper.text()).toContain('食堂')
  })
})

describe('CanteenManager 食堂备忘', () => {
  test('空状态', () => {
    const wrapper = mount(CanteenManager)
    expect(wrapper.text()).toContain('还没有食堂备忘')
  })

  test('显示食堂记录', () => {
    const store = useLifeStore()
    store.addCanteen({ name: '一食堂二楼', price: 12, rating: 4, tags: '便宜' })
    const wrapper = mount(CanteenManager)
    expect(wrapper.text()).toContain('一食堂二楼')
  })
})

describe('PlaceManager 常用地点', () => {
  test('空状态', () => {
    const wrapper = mount(PlaceManager)
    expect(wrapper.text()).toContain('还没有常用地点')
  })

  test('显示地点', () => {
    const store = useLifeStore()
    store.addPlace({ name: '第三教学楼', category: 'building', location: '东门' })
    const wrapper = mount(PlaceManager)
    expect(wrapper.text()).toContain('第三教学楼')
  })
})

describe('PackageManager 快递', () => {
  test('空状态', () => {
    const wrapper = mount(PackageManager)
    expect(wrapper.text()).toContain('没有快递')
  })

  test('待取快递显示', () => {
    const store = useLifeStore()
    store.addPackage({ code: 'SF123', pickupCode: '1-2-3', location: '菜鸟驿站', taken: false })
    const wrapper = mount(PackageManager)
    expect(wrapper.text()).toContain('SF123')
    expect(wrapper.text()).toContain('待取')
  })

  test('已取快递不显示在待取列表', () => {
    const store = useLifeStore()
    store.addPackage({ code: 'SF456', taken: true })
    const wrapper = mount(PackageManager)
    expect(wrapper.text()).toContain('已取')
  })
})