import { defineStore } from 'pinia'

interface Song {
  name: string
  src: string
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
  actions: {},
})
