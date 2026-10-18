import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    semesterStart: '',
    totalWeeks: 20,
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },
    setSemesterStart(date) {
      this.semesterStart = date
    },
    setTotalWeeks(weeks) {
      this.totalWeeks = Number(weeks)
    },
  },
  persist: true,
})