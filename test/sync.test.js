import { setActivePinia, createPinia } from 'pinia'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.stubEnv('VITE_LEANCLOUD_ID', 'test-app-id')
  vi.stubEnv('VITE_LEANCLOUD_KEY', 'test-app-key')
  globalThis.fetch = vi.fn()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

function mockFetchSequence(...responses) {
  responses.forEach((res) => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(res),
    })
  })
}

describe('sync store - syncToCloud', () => {
  test('未登录返回错误', async () => {
    const { useSyncStore } = await import('../src/stores/sync.js')
    const sync = useSyncStore()
    const result = await sync.syncToCloud()
    expect(result.error).toBe('未登录')
  })

  test('成功上传（新建）', async () => {
    const { useSyncStore } = await import('../src/stores/sync.js')
    const { useAuthStore } = await import('../src/stores/auth.js')
    const { useStudyStore } = await import('../src/stores/study.js')

    const auth = useAuthStore()
    await auth.register('testuser', 'password123')
    await auth.login('testuser', 'password123')

    const study = useStudyStore()
    study.addCourse({ name: '高数', day: 1 })

    mockFetchSequence(
      { results: [] },
      { objectId: 'new123', createdAt: '2026-01-01T00:00:00Z' }
    )

    const sync = useSyncStore()
    const result = await sync.syncToCloud()
    expect(result.success).toBe(true)
    expect(sync.syncStatus).toBe('success')
    expect(sync.lastSyncAt).toBeTruthy()
  })

  test('成功上传（更新已有）', async () => {
    const { useSyncStore } = await import('../src/stores/sync.js')
    const { useAuthStore } = await import('../src/stores/auth.js')

    const auth = useAuthStore()
    await auth.register('testuser', 'password123')
    await auth.login('testuser', 'password123')

    mockFetchSequence(
      { results: [{ objectId: 'existing123', app_data: { version: '2.0.0' } }] },
      { updatedAt: '2026-01-02T00:00:00Z' }
    )

    const sync = useSyncStore()
    const result = await sync.syncToCloud()
    expect(result.success).toBe(true)
  })
})

describe('sync store - syncFromCloud', () => {
  test('成功从云端拉取数据', async () => {
    const { useSyncStore } = await import('../src/stores/sync.js')
    const { useAuthStore } = await import('../src/stores/auth.js')
    const { useStudyStore } = await import('../src/stores/study.js')

    const auth = useAuthStore()
    await auth.register('testuser', 'password123')
    await auth.login('testuser', 'password123')

    mockFetchSequence({
      results: [{
        objectId: '123',
        app_data: {
          version: '2.0.0',
          study: { courses: [{ name: '高数', day: 1 }] },
        },
      }],
    })

    const sync = useSyncStore()
    const result = await sync.syncFromCloud()
    expect(result.success).toBe(true)
    expect(sync.syncStatus).toBe('success')

    const study = useStudyStore()
    expect(study.courses).toHaveLength(1)
    expect(study.courses[0].name).toBe('高数')
  })

  test('云端无数据时不报错', async () => {
    const { useSyncStore } = await import('../src/stores/sync.js')
    const { useAuthStore } = await import('../src/stores/auth.js')

    const auth = useAuthStore()
    await auth.register('testuser', 'password123')
    await auth.login('testuser', 'password123')

    mockFetchSequence({ results: [] })

    const sync = useSyncStore()
    const result = await sync.syncFromCloud()
    expect(result.success).toBe(true)
  })

  test('未登录返回错误', async () => {
    const { useSyncStore } = await import('../src/stores/sync.js')
    const sync = useSyncStore()
    const result = await sync.syncFromCloud()
    expect(result.error).toBe('未登录')
  })
})

describe('sync store - autoSync', () => {
  test('设置自动同步', async () => {
    const { useSyncStore } = await import('../src/stores/sync.js')
    const sync = useSyncStore()
    sync.setAutoSync(true)
    expect(sync.autoSync).toBe(true)
    sync.setAutoSync(false)
    expect(sync.autoSync).toBe(false)
  })
})

describe('sync store - resetStatus', () => {
  test('重置状态', async () => {
    const { useSyncStore } = await import('../src/stores/sync.js')
    const sync = useSyncStore()
    sync.syncStatus = 'error'
    sync.syncError = 'some error'
    sync.resetStatus()
    expect(sync.syncStatus).toBe('idle')
    expect(sync.syncError).toBeNull()
  })
})