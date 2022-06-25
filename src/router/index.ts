import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('@/layouts/DefaultLayout.vue'),
      redirect: '/home',
      children: [
        {
          path: '/home',
          name: 'home',
          component: () => import('@/layouts/HomeLayout.vue'),
          redirect: '/discover',
          children: [
            {
              path: '/discover',
              name: 'discover',
              component: () => import('@/views/home/DiscoverMusic.vue'),
            },
            {
              path: '/podcast',
              name: 'podcast',
              component: () => import('@/views/home/PodcastView.vue'),
            },
            {
              path: '/search/:text',
              name: 'search',
              component: () => import('@/views/home/SearchResult.vue'),
            },
          ],
        },
      ],
    },
  ],
})

export default router
