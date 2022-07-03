import { createFetch } from '@vueuse/core'

export const useFetch = createFetch({
  baseUrl: 'https://music.ccitsxy.vercel.app',
})
