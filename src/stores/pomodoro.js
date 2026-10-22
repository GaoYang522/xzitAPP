import { defineStore } from 'pinia'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const usePomodoroStore = defineStore('pomodoro', {
  state: () => ({
    settings: {
      focusDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      cyclesBeforeLongBreak: 4,
    },
    sessions: [],
    currentCycle: 0,
  }),
  getters: {
    todaySessions(state) {
      const today = formatDate(new Date())
      return state.sessions.filter((s) => s.completedAt && s.completedAt.startsWith(today))
    },
    weekSessions(state) {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return state.sessions.filter((s) => {
        if (!s.completedAt) return false
        return new Date(s.completedAt) >= weekAgo
      })
    },
    todayFocusSessions() {
      return this.todaySessions.filter((s) => s.type === 'focus')
    },
    todayTotalMinutes() {
      return this.todayFocusSessions.reduce((sum, s) => sum + s.duration, 0)
    },
    weekTotalMinutes() {
      return this.weekSessions
        .filter((s) => s.type === 'focus')
        .reduce((sum, s) => sum + s.duration, 0)
    },
    todaySessionCount() {
      return this.todayFocusSessions.length
    },
  },
  actions: {
    updateSettings(settings) {
      Object.assign(this.settings, settings)
    },

    recordSession({ subject, duration, type }) {
      const session = {
        id: generateId(),
        subject: subject || '未命名',
        duration: Number(duration) || 0,
        type: type || 'focus',
        completedAt: new Date().toISOString(),
      }
      this.sessions.push(session)
      if (type === 'focus') {
        this.currentCycle += 1
      }
      return session
    },

    clearHistory() {
      this.sessions = []
      this.currentCycle = 0
    },

    getStatsByDay(date) {
      const dayStr = formatDate(date)
      const daySessions = this.sessions.filter(
        (s) => s.completedAt && s.completedAt.startsWith(dayStr) && s.type === 'focus'
      )
      return {
        count: daySessions.length,
        totalMinutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
        subjects: daySessions.reduce((acc, s) => {
          acc[s.subject] = (acc[s.subject] || 0) + s.duration
          return acc
        }, {}),
      }
    },
  },
  persist: true,
})