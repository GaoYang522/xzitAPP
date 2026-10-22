import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient.js'
import { exportAllData, importAllData } from '../utils/exportImport.js'
import { useAuthStore } from './auth.js'

export const useSyncStore = defineStore('sync', {
  state: () => ({
    lastSyncAt: null,
    syncStatus: 'idle',
    syncError: null,
    autoSync: false,
  }),
  getters: {
    isConfigured: () => isSupabaseConfigured(),
  },
  actions: {
    async syncToCloud() {
      if (!isSupabaseConfigured()) {
        return { error: 'Supabase 未配置，请在环境变量中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY' }
      }
      const auth = useAuthStore()
      if (!auth.currentUser) {
        return { error: '未登录' }
      }
      this.syncStatus = 'syncing'
      this.syncError = null
      try {
        const data = exportAllData()
        const { error } = await supabase
          .from('user_data')
          .upsert({
            user_id: auth.currentUser,
            data,
            updated_at: new Date().toISOString(),
          })
        if (error) throw error
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
      if (!isSupabaseConfigured()) {
        return { error: 'Supabase 未配置' }
      }
      const auth = useAuthStore()
      if (!auth.currentUser) {
        return { error: '未登录' }
      }
      this.syncStatus = 'syncing'
      this.syncError = null
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('data')
          .eq('user_id', auth.currentUser)
          .single()
        if (error) throw error
        if (data && data.data) {
          importAllData(data.data)
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