import { defineStore } from 'pinia'
import { makeActions } from '../utils/storeHelpers'

export const useToolsStore = defineStore('tools', {
  state: () => ({
    todos: [],
    notes: [],
    countdowns: [],
    habits: [],
  }),
  actions: {
    ...makeActions('todos', 'todo'),
    ...makeActions('notes', 'note'),
    ...makeActions('countdowns', 'countdown'),
    ...makeActions('habits', 'habit'),
    toggleTodoDone(id) {
      const item = this.todos.find((t) => t.id === id)
      if (item) item.done = !item.done
    },
    toggleHabitCheck(habitId, dateStr) {
      const habit = this.habits.find((h) => h.id === habitId)
      if (!habit) return
      if (!habit.checkins) habit.checkins = []
      const idx = habit.checkins.indexOf(dateStr)
      if (idx !== -1) habit.checkins.splice(idx, 1)
      else habit.checkins.push(dateStr)
    },
    getHabitStreak(habitId) {
      const habit = this.habits.find((h) => h.id === habitId)
      if (!habit || !habit.checkins || habit.checkins.length === 0) return 0
      const sorted = [...habit.checkins].sort()
      let streak = 0
      const today = new Date()
      for (let i = 0; i < 365; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        if (sorted.includes(ds)) streak++
        else if (i > 0) break
      }
      return streak
    },
  },
  persist: true,
})