import { createFetch } from '@vueuse/core'

export const api = createFetch({
  baseUrl: 'https://music.ccitsxy.vercel.app',
})
