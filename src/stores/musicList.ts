import { defineStore } from 'pinia'

export const useCounterStore = defineStore({
  id: 'music-list',
  state: () => ({
    list: [],
  }),
  getters: {},
  actions: {},
})
