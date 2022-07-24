import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://music.ccitsxy.vercel.app/',
  params: {
    cookie: localStorage.getItem('cookie'),
  },
})
