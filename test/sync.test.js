import { setActivePinia, createPinia } from 'pinia'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../src/utils/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { data: { version: '2.0.0', study: { courses: [{ name: '高数' }] } } },
            error: null,
          }),
        })),
      })),
    })),
  },
  isSupabaseConfigured: vi.fn(() => true),
}))

import { useSyncStore } from '../src/stores/sync.js'
import { useAuthStore } from '../src/stores/auth.js'
import { useStudyStore } from '../src/stores/study.js'
import { isSupabaseConfigured } from '../src/utils/supabaseClient.js'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('sync store - syncToCloud', () => {
  test('未配置返回错误', async () => {
    isSupabaseConfigured.mockReturnValueOnce(false)
    const sync = useSyncStore()
    const result = await sync.syncToCloud()
    expect(result.error).toContain('未配置')
  })

  test('未登录返回错误', async () => {
    const sync = useSyncStore()
    const result = await sync.syncToCloud()
    expect(result.error).toBe('未登录')
  })

  test('成功同步到云端', async () => {
    const auth = useAuthStore()
    await auth.register('testuser', 'password123')
    await auth.login('testuser', 'password123')

    const study = useStudyStore()
    study.addCourse({ name: '高数', day: 1 })

    const sync = useSyncStore()
    const result = await sync.syncToCloud()
    expect(result.success).toBe(true)
    expect(sync.syncStatus).toBe('success')
    expect(sync.lastSyncAt).toBeTruthy()
  })
})

describe('sync store - syncFromCloud', () => {
  test('成功从云端拉取数据', async () => {
    const auth = useAuthStore()
    await auth.register('testuser', 'password123')
    await auth.login('testuser', 'password123')

    const sync = useSyncStore()
    const result = await sync.syncFromCloud()
    expect(result.success).toBe(true)
    expect(sync.syncStatus).toBe('success')

    const study = useStudyStore()
    expect(study.courses).toHaveLength(1)
    expect(study.courses[0].name).toBe('高数')
  })

  test('未登录返回错误', async () => {
    const sync = useSyncStore()
    const result = await sync.syncFromCloud()
    expect(result.error).toBe('未登录')
  })
})

describe('sync store - autoSync', () => {
  test('设置自动同步', () => {
    const sync = useSyncStore()
    sync.setAutoSync(true)
    expect(sync.autoSync).toBe(true)
    sync.setAutoSync(false)
    expect(sync.autoSync).toBe(false)
  })
})

describe('sync store - resetStatus', () => {
  test('重置状态', () => {
    const sync = useSyncStore()
    sync.syncStatus = 'error'
    sync.syncError = 'some error'
    sync.resetStatus()
    expect(sync.syncStatus).toBe('idle')
    expect(sync.syncError).toBeNull()
  })
})