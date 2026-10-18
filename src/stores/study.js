import { defineStore } from 'pinia'
import { makeActions } from '../utils/storeHelpers'

export const useStudyStore = defineStore('study', {
  state: () => ({
    courses: [],
    homework: [],
    exams: [],
    grades: [],
  }),
  actions: {
    ...makeActions('courses', 'course'),
    ...makeActions('homework', 'homework'),
    ...makeActions('exams', 'exam'),
    ...makeActions('grades', 'grade'),
    toggleHomeworkDone(id) {
      const item = this.homework.find((h) => h.id === id)
      if (item) item.done = !item.done
    },
  },
  persist: true,
})