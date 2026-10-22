import { setActivePinia, createPinia } from 'pinia'
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from '../src/stores/auth.js'
import { saveUserData, loadUserData, deleteUserData, hasUserData } from '../src/utils/userData.js'
import { useStudyStore } from '../src/stores/study.js'
import { useToolsStore } from '../src/stores/tools.js'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

afterEach(() => {
  localStorage.clear()
})

describe('auth store - register', () => {
  test('正常注册', async () => {
    const auth = useAuthStore()
    const result = await auth.register('testuser', 'password123')
    expect(result.success).toBe(true)
    expect(auth.users).toHaveLength(1)
    expect(auth.users[0].username).toBe('testuser')
    expect(auth.users[0].passwordHash).toBeTruthy()
    expect(auth.users[0].passwordHash).not.toBe('password123')
  })

  test('用户名已存在', async () => {
    const auth = useAuthStore()
    await auth.register('testuser', 'password123')
    const result = await auth.register('testuser', 'different')
    expect(result.error).toBe('用户名已存在')
  })

  test('空用户名', async () => {
    const auth = useAuthStore()
    const result = await auth.register('', 'password')
    expect(result.error).toContain('不能为空')
  })

  test('空密码', async () => {
    const auth = useAuthStore()
    const result = await auth.register('user', '')
    expect(result.error).toContain('不能为空')
  })

  test('用户名太短', async () => {
    const auth = useAuthStore()
    const result = await auth.register('a', 'password')
    expect(result.error).toContain('至少2个字符')
  })

  test('密码太短', async () => {
    const auth = useAuthStore()
    const result = await auth.register('user', 'ab')
    expect(result.error).toContain('至少4个字符')
  })
})

describe('auth store - login', () => {
  test('正常登录', async () => {
    const auth = useAuthStore()
    await auth.register('testuser', 'password123')
    const result = await auth.login('testuser', 'password123')
    expect(result.success).toBe(true)
    expect(auth.currentUser).toBe('testuser')
    expect(auth.isLoggedIn).toBe(true)
  })

  test('用户不存在', async () => {
    const auth = useAuthStore()
    const result = await auth.login('nobody', 'password')
    expect(result.error).toBe('用户不存在')
    expect(auth.isLoggedIn).toBe(false)
  })

  test('密码错误', async () => {
    const auth = useAuthStore()
    await auth.register('testuser', 'password123')
    const result = await auth.login('testuser', 'wrongpassword')
    expect(result.error).toBe('密码错误')
    expect(auth.isLoggedIn).toBe(false)
  })
})

describe('auth store - logout', () => {
  test('登出后currentUser为null', async () => {
    const auth = useAuthStore()
    await auth.register('user', 'pass1234')
    await auth.login('user', 'pass1234')
    expect(auth.isLoggedIn).toBe(true)
    auth.logout()
    expect(auth.currentUser).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
  })
})

describe('auth store - deleteUser', () => {
  test('删除用户', async () => {
    const auth = useAuthStore()
    await auth.register('user1', 'pass1234')
    await auth.register('user2', 'pass1234')
    expect(auth.users).toHaveLength(2)
    const result = auth.deleteUser('user1')
    expect(result).toBe(true)
    expect(auth.users).toHaveLength(1)
    expect(auth.users[0].username).toBe('user2')
  })

  test('删除不存在的用户返回false', () => {
    const auth = useAuthStore()
    const result = auth.deleteUser('nobody')
    expect(result).toBe(false)
  })

  test('删除当前登录用户后登出', async () => {
    const auth = useAuthStore()
    await auth.register('user', 'pass1234')
    await auth.login('user', 'pass1234')
    auth.deleteUser('user')
    expect(auth.currentUser).toBeNull()
  })
})

describe('auth store - getters', () => {
  test('currentUserInfo返回当前用户信息', async () => {
    const auth = useAuthStore()
    await auth.register('testuser', 'password123')
    await auth.login('testuser', 'password123')
    expect(auth.currentUserInfo.username).toBe('testuser')
    expect(auth.currentUserInfo.createdAt).toBeTruthy()
  })

  test('未登录时currentUserInfo为null', () => {
    const auth = useAuthStore()
    expect(auth.currentUserInfo).toBeNull()
  })
})

describe('userData - 数据隔离', () => {
  test('saveUserData保存数据到独立key', () => {
    const study = useStudyStore()
    study.addCourse({ name: '高数', day: 1 })
    saveUserData('userA')
    expect(localStorage.getItem('xzitapp_user_userA')).toBeTruthy()
    const data = JSON.parse(localStorage.getItem('xzitapp_user_userA'))
    expect(data.study.courses).toHaveLength(1)
  })

  test('loadUserData加载数据', () => {
    const study = useStudyStore()
    study.addCourse({ name: '高数', day: 1 })
    saveUserData('userA')

    study.courses = []
    expect(study.courses).toHaveLength(0)

    loadUserData('userA')
    const studyReloaded = useStudyStore()
    expect(studyReloaded.courses).toHaveLength(1)
    expect(studyReloaded.courses[0].name).toBe('高数')
  })

  test('不同用户数据隔离', () => {
    const study = useStudyStore()
    study.addCourse({ name: '高数', day: 1 })
    saveUserData('userA')

    study.courses = []
    study.addCourse({ name: '英语', day: 2 })
    saveUserData('userB')

    loadUserData('userA')
    const studyA = useStudyStore()
    expect(studyA.courses[0].name).toBe('高数')

    loadUserData('userB')
    const studyB = useStudyStore()
    expect(studyB.courses[0].name).toBe('英语')
  })

  test('deleteUserData删除用户数据', () => {
    const study = useStudyStore()
    study.addCourse({ name: '高数' })
    saveUserData('userA')
    expect(hasUserData('userA')).toBe(true)

    deleteUserData('userA')
    expect(hasUserData('userA')).toBe(false)
  })

  test('loadUserData无数据时清空当前数据', () => {
    const study = useStudyStore()
    study.addCourse({ name: '高数' })
    loadUserData('newuser')
    const studyAfter = useStudyStore()
    expect(studyAfter.courses).toHaveLength(0)
  })
})