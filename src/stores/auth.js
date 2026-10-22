import { defineStore } from 'pinia'

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    users: [],
    currentUser: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.currentUser,
    currentUserInfo(state) {
      return state.users.find((u) => u.username === state.currentUser) || null
    },
  },
  actions: {
    async register(username, password) {
      if (!username || !password) {
        return { error: '用户名和密码不能为空' }
      }
      if (username.length < 2) {
        return { error: '用户名至少2个字符' }
      }
      if (password.length < 4) {
        return { error: '密码至少4个字符' }
      }
      if (this.users.find((u) => u.username === username)) {
        return { error: '用户名已存在' }
      }
      const passwordHash = await hashPassword(password)
      this.users.push({
        username,
        passwordHash,
        createdAt: new Date().toISOString(),
      })
      return { success: true }
    },

    async login(username, password) {
      const user = this.users.find((u) => u.username === username)
      if (!user) {
        return { error: '用户不存在' }
      }
      const passwordHash = await hashPassword(password)
      if (user.passwordHash !== passwordHash) {
        return { error: '密码错误' }
      }
      this.currentUser = username
      return { success: true }
    },

    logout() {
      this.currentUser = null
    },

    deleteUser(username) {
      const idx = this.users.findIndex((u) => u.username === username)
      if (idx !== -1) {
        this.users.splice(idx, 1)
        if (this.currentUser === username) {
          this.currentUser = null
        }
        return true
      }
      return false
    },
  },
  persist: {
    key: 'xzitapp_auth',
  },
})