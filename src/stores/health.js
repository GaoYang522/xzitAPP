import { defineStore } from 'pinia'
import { makeActions } from '../utils/storeHelpers'
import { formatDate } from '../composables/useDate'

export const useHealthStore = defineStore('health', {
  state: () => ({
    checkins: [],
    fitness: [],
    exercises: [],
    moods: [],
  }),
  actions: {
    ...makeActions('checkins', 'checkin'),
    ...makeActions('fitness', 'fitness'),
    ...makeActions('exercises', 'exercise'),
    ...makeActions('moods', 'mood'),
    isCheckedToday() {
      const todayStr = formatDate(new Date())
      return this.checkins.some((c) => c.date === todayStr)
    },
  },
  persist: true,
})