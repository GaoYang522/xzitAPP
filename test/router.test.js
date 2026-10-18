import router from '../src/router/index.js'

describe('路由配置', () => {
  test('应有 7 个路由', () => {
    expect(router.options.routes).toHaveLength(7)
  })

  test('路由路径正确', () => {
    const paths = router.options.routes.map((r) => r.path)
    expect(paths).toEqual([
      '/',
      '/study',
      '/life',
      '/club',
      '/health',
      '/tools',
      '/settings',
    ])
  })

  test('路由名称正确', () => {
    const names = router.options.routes.map((r) => r.name)
    expect(names).toEqual([
      'home',
      'study',
      'life',
      'club',
      'health',
      'tools',
      'settings',
    ])
  })

  test('每个路由都有 component', () => {
    router.options.routes.forEach((r) => {
      expect(r.component).toBeDefined()
    })
  })
})