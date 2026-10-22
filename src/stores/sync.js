import { defineStore } from 'pinia'
import { exportAllData, importAllData } from '../utils/exportImport.js'
import { useAuthStore } from './auth.js'

const LC_ID = import.meta.env.VITE_LEANCLOUD_ID || ''
const LC_KEY = import.meta.env.VITE_LEANCLOUD_KEY || ''
const LC_BASE = `https://${LC_ID}.api.lncldapi.com/1.1/classes/user_data`

function isLeanCloudConfigured() {
  return !!LC_ID && !!LC_KEY
}

function lcHeaders() {
  return {
    'X-LC-Id': LC_ID,
    'X-LC-Key': LC_KEY,
    'Content-Type': 'application/json',
  }
}

async function findUserData(userId) {
  const where = encodeURIComponent(JSON.stringify({ user_id: userId }))
  const res = await fetch(`${LC_BASE}?where=${where}&limit=1`, {
    headers: lcHeaders(),
  })
  if (!res.ok) throw new Error(`查询失败: ${res.status}`)
  const json = await res.json()
  return json.results && json.results[0] ? json.results[0] : null
}

export const useSyncStore = defineStore('sync', {
  state: () => ({
    lastSyncAt: null,
    syncStatus: 'idle',
    syncError: null,
    autoSync: false,
  }),
  getters: {
    isConfigured: () => isLeanCloudConfigured(),
  },
  actions: {
    async syncToCloud() {
      if (!isLeanCloudConfigured()) {
        return { error: 'LeanCloud 未配置，请在 .env 中设置 VITE_LEANCLOUD_ID 和 VITE_LEANCLOUD_KEY' }
      }
      const auth = useAuthStore()
      if (!auth.currentUser) {
        return { error: '未登录' }
      }
      this.syncStatus = 'syncing'
      this.syncError = null
      try {
        const data = exportAllData()
        const payload = {
          user_id: auth.currentUser,
          app_data: data,
          updated_at: new Date().toISOString(),
        }

        const existing = await findUserData(auth.currentUser)
        if (existing) {
          const res = await fetch(`${LC_BASE}/${existing.objectId}`, {
            method: 'PUT',
            headers: lcHeaders(),
            body: JSON.stringify(payload),
          })
          if (!res.ok) throw new Error(`更新失败: ${res.status}`)
        } else {
          const res = await fetch(LC_BASE, {
            method: 'POST',
            headers: lcHeaders(),
            body: JSON.stringify(payload),
          })
          if (!res.ok) throw new Error(`创建失败: ${res.status}`)
        }

        this.lastSyncAt = new Date().toISOString()
        this.syncStatus = 'success'
        return { success: true }
      } catch (e) {
        this.syncStatus = 'error'
        this.syncError = e.message
        return { error: e.message }
      }
    },

    async syncFromCloud() {
      if (!isLeanCloudConfigured()) {
        return { error: 'LeanCloud 未配置' }
      }
      const auth = useAuthStore()
      if (!auth.currentUser) {
        return { error: '未登录' }
      }
      this.syncStatus = 'syncing'
      this.syncError = null
      try {
        const existing = await findUserData(auth.currentUser)
        if (existing && existing.app_data) {
          importAllData(existing.app_data)
        }
        this.syncStatus = 'success'
        return { success: true }
      } catch (e) {
        this.syncStatus = 'error'
        this.syncError = e.message
        return { error: e.message }
      }
    },

    setAutoSync(enabled) {
      this.autoSync = enabled
    },

    resetStatus() {
      this.syncStatus = 'idle'
      this.syncError = null
    },
  },
  persist: true,
})