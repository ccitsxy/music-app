import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('@/layouts/MainLayout.vue'),
      redirect: '/discover',
      children: [
        {
          path: '/audio',
          name: 'audio',
          component: () => import('@/views/AudioPlayer.vue'),
        },
        {
          path: '/search/:text',
          name: 'search',
          component: () => import('@/views/SearchResult.vue'),
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('@/views/UserSettings.vue'),
        },
        {
          path: '/discover',
          name: 'discover',
          component: () => import('@/views/DiscoverSongs.vue'),
        },
        {
          path: '/podcast',
          name: 'podcast',
          component: () => import('@/views/PodcastView.vue'),
        },
      ],
    },
  ],
})

export default router
