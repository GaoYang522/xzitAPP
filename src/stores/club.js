import { defineStore } from 'pinia'
import { makeActions } from '../utils/storeHelpers'

export const useClubStore = defineStore('club', {
  state: () => ({
    clubs: [],
    activities: [],
    posts: [],
  }),
  actions: {
    ...makeActions('clubs', 'club'),
    ...makeActions('activities', 'activity'),
    ...makeActions('posts', 'post'),
  },
  persist: true,
})