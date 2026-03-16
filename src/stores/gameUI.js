import { defineStore } from 'pinia'

export const useGameUIStore = defineStore('gameUI', {
  state: () => ({
    time: 0,
    showPenaltyFlash: false,
  }),

  actions: {
    setTime(t) {
      this.time = t
    },
    setPenaltyFlash(v) {
      this.showPenaltyFlash = v
    },
  },
})
