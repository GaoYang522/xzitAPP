import { describe, test, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import App from '../src/App.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div/>' } },
    { path: '/login', name: 'login', component: { template: '<div/>' } },
  ],
})

beforeEach(async () => {
  setActivePinia(createPinia())
  localStorage.setItem('xzitapp_auth', JSON.stringify({ users: [{ username: 'test', passwordHash: 'x', createdAt: '2026-01-01' }], currentUser: 'test' }))
  await router.push('/')
})

function mountApp() {
  return mount(App, {
    global: {
      plugins: [router],
      stubs: { 'router-view': true },
    },
  })
}

describe('App 响应式导航', () => {
  test('有两个导航栏', () => {
    const wrapper = mountApp()
    const navs = wrapper.findAll('nav')
    expect(navs).toHaveLength(2)
  })

  test('桌面导航有hidden md:block', () => {
    const wrapper = mountApp()
    const navs = wrapper.findAll('nav')
    expect(navs[0].classes()).toContain('hidden')
    expect(navs[0].classes()).toContain('md:block')
  })

  test('移动端导航有md:hidden', () => {
    const wrapper = mountApp()
    const navs = wrapper.findAll('nav')
    expect(navs[1].classes()).toContain('md:hidden')
  })

  test('移动端导航fixed bottom-0', () => {
    const wrapper = mountApp()
    const navs = wrapper.findAll('nav')
    expect(navs[1].classes()).toContain('fixed')
    expect(navs[1].classes()).toContain('bottom-0')
  })

  test('main有pb-24给底部导航留空间', () => {
    const wrapper = mountApp()
    const main = wrapper.find('main')
    expect(main.classes()).toContain('pb-24')
  })
})

describe('Capacitor 配置', () => {
  test('capacitor.config.json存在且配置正确', () => {
    const configPath = resolve(process.cwd(), 'capacitor.config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    expect(config.appId).toBe('com.xzit.campusapp')
    expect(config.appName).toBe('校园一站式APP')
    expect(config.webDir).toBe('dist')
  })
})

describe('viewport meta', () => {
  test('index.html有viewport-fit=cover', () => {
    const htmlPath = resolve(process.cwd(), 'index.html')
    const html = readFileSync(htmlPath, 'utf-8')
    expect(html).toContain('viewport-fit=cover')
    expect(html).toContain('user-scalable=no')
  })
})