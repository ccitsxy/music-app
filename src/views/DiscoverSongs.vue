<script setup lang="ts">
import { useFetch } from '@/composables/useFetch'

const { data } = useFetch('/banner').json()
</script>

<template>
  <div>
    <n-spin :show="!data">
      <n-carousel
        autoplay
        effect="card"
        class="w-full h-200px relative"
        prev-slide-style="position: absolute;left: 28rem;opacity: 1"
        next-slide-style="position: absolute;left: unset;right: -5.5rem;opacity: 1"
        centered-slides
      >
        <n-carousel-item
          v-for="item in data?.banners"
          :key="item.imageUrl"
          class="!w-540px"
        >
          <img class="w-full h-full" :src="item.imageUrl" />
          <n-el
            class="text-white bg-$primary-color text-xs absolute right-0 bottom-0 p-1"
          >
            {{ item.typeTitle }}
          </n-el>
        </n-carousel-item>
      </n-carousel>
    </n-spin>
  </div>
</template>
