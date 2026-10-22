import router from '../src/router/index.js'

describe('路由配置', () => {
  test('应有 9 个路由', () => {
    expect(router.options.routes).toHaveLength(9)
  })

  test('路由路径正确', () => {
    const paths = router.options.routes.map((r) => r.path)
    expect(paths).toEqual([
      '/login',
      '/',
      '/study',
      '/life',
      '/club',
      '/health',
      '/tools',
      '/assistant',
      '/settings',
    ])
  })

  test('路由名称正确', () => {
    const names = router.options.routes.map((r) => r.name)
    expect(names).toEqual([
      'login',
      'home',
      'study',
      'life',
      'club',
      'health',
      'tools',
      'assistant',
      'settings',
    ])
  })

  test('每个路由都有 component', () => {
    router.options.routes.forEach((r) => {
      expect(r.component).toBeDefined()
    })
  })

  test('assistant 路由存在', () => {
    const route = router.options.routes.find((r) => r.name === 'assistant')
    expect(route).toBeDefined()
    expect(route.path).toBe('/assistant')
  })
})