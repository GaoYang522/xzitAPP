import { defineStore } from 'pinia'
import { handleMessage } from '../agents/mainAgent.js'
import { testConnectivity } from '../utils/llmProvider.js'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
}

function getLlmOptions(apiConfig) {
  return {
    apiKey: apiConfig.llmApiKey,
    baseUrl: apiConfig.llmBaseUrl,
    model: apiConfig.llmModel,
    compileApiUrl: apiConfig.compileApiUrl,
    compileApiKey: apiConfig.compileApiKey,
  }
}

export const useAssistantStore = defineStore('assistant', {
  state: () => ({
    apiConfig: {
      llmProvider: 'deepseek',
      llmApiKey: '',
      llmBaseUrl: 'https://api.deepseek.com',
      llmModel: 'deepseek-chat',
      compileApiUrl: '',
      compileApiKey: '',
    },
    sessions: [],
    currentSessionId: null,
  }),
  getters: {
    currentSession(state) {
      return state.sessions.find((s) => s.id === state.currentSessionId) || null
    },
    sessionCount(state) {
      return state.sessions.length
    },
    hasApiKey(state) {
      return !!state.apiConfig.llmApiKey
    },
  },
  actions: {
    setApiConfig(config) {
      Object.assign(this.apiConfig, config)
    },

    async testApiConnectivity() {
      return testConnectivity(getLlmOptions(this.apiConfig))
    },

    createSession() {
      const session = {
        id: generateId(),
        title: '新对话',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      }
      this.sessions.unshift(session)
      this.currentSessionId = session.id
      return session
    },

    async sendMessage(text) {
      if (!this.currentSession) {
        this.createSession()
      }
      const session = this.currentSession

      session.messages.push({
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      })

      if (session.messages.length === 1) {
        session.title = text.slice(0, 20) + (text.length > 20 ? '...' : '')
      }

      const options = getLlmOptions(this.apiConfig)
      const result = await handleMessage(text, options)

      const assistantMessage = {
        role: 'assistant',
        content: result.content || result.message || '',
        timestamp: new Date().toISOString(),
        routeInfo: result.routeInfo || null,
        type: result.type || 'single',
        agentId: result.agentId || null,
        agentName: result.agentName || null,
        candidates: result.candidates || null,
        steps: result.steps || null,
        error: result.error || null,
      }

      session.messages.push(assistantMessage)
      session.updatedAt = new Date().toISOString()

      return result
    },

    deleteSession(id) {
      const idx = this.sessions.findIndex((s) => s.id === id)
      if (idx !== -1) {
        this.sessions.splice(idx, 1)
        if (this.currentSessionId === id) {
          this.currentSessionId = this.sessions.length > 0 ? this.sessions[0].id : null
        }
      }
    },

    clearAllSessions() {
      this.sessions = []
      this.currentSessionId = null
    },

    setCurrentSession(id) {
      this.currentSessionId = id
    },

    getSessionsForExport(includeApiKey = false) {
      const data = {
        sessions: this.sessions,
        currentSessionId: this.currentSessionId,
      }
      if (includeApiKey) {
        data.apiConfig = this.apiConfig
      } else {
        data.apiConfig = { ...this.apiConfig, llmApiKey: '', compileApiKey: '' }
      }
      return data
    },

    restoreFromImport(data) {
      if (data.sessions) this.sessions = data.sessions
      if (data.currentSessionId !== undefined) this.currentSessionId = data.currentSessionId
      if (data.apiConfig) {
        Object.assign(this.apiConfig, data.apiConfig)
      }
    },
  },
  persist: true,
})