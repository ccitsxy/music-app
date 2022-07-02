import { defineStore } from 'pinia'

export interface Song {
  src: string
  name: string
  alia: string[]
  picUrl: string
  artists: {
    id: string
    name: string
  }[]
}

interface SongState {
  songs: Song[]
  currentIndex: number
}

export const useSongStore = defineStore({
  id: 'music-list',
  state: (): SongState => ({
    songs: [],
    currentIndex: 0,
  }),
  actions: {
    addIndex() {
      this.currentIndex++
    },
    decIndex() {
      this.currentIndex--
    },
  },
})
