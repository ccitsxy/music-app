import { defineStore } from 'pinia'

interface SongState {
  songs: string[]
  currentIndex: number
}

export const useSongStore = defineStore({
  id: 'music-list',
  state: (): SongState => ({
    songs: [],
    currentIndex: 0,
  }),
  actions: {
    addCurrentIndex() {
      if (this.songs.length) {
        this.currentIndex++
      }
    },
    subCurrentIndex() {
      if (this.songs.length) {
        this.currentIndex--
      }
    },
  },
})
