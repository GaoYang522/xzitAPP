import { defineStore } from 'pinia'
import { makeActions } from '../utils/storeHelpers'

export const useLifeStore = defineStore('life', {
  state: () => ({
    cardBalance: 0,
    cardRecords: [],
    canteen: [],
    places: [],
    packages: [],
  }),
  actions: {
    ...makeActions('canteen', 'canteen'),
    ...makeActions('places', 'place'),
    ...makeActions('packages', 'package'),
    addCardRecord(record) {
      this.cardRecords.push({ ...record, id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8) })
      if (record.type === 'expense') this.cardBalance -= Number(record.amount)
      else this.cardBalance += Number(record.amount)
    },
    removeCardRecord(id) {
      const record = this.cardRecords.find((r) => r.id === id)
      if (record) {
        if (record.type === 'expense') this.cardBalance += Number(record.amount)
        else this.cardBalance -= Number(record.amount)
        this.cardRecords = this.cardRecords.filter((r) => r.id !== id)
      }
    },
    togglePackageTaken(id) {
      const item = this.packages.find((p) => p.id === id)
      if (item) item.taken = !item.taken
    },
  },
  persist: true,
})