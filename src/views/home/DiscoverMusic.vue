<script setup lang="ts">
import { useFetch } from '@vueuse/core'

const { data } = useFetch('https://music.ccitsxy.vercel.app/banner').json()
</script>

<template>
  <div>
    <n-spin :show="!data">
      <n-carousel
        autoplay
        effect="card"
        prev-slide-style="transform: translateX(-150%) translateZ(-800px);"
        next-slide-style="transform: translateX(50%) translateZ(-800px);"
        class="w-[81vw] h-[12vw]"
      >
        <n-carousel-item
          v-for="item in data?.banners"
          :key="item.imageUrl"
          :style="{ width: '40%' }"
        >
          <img class="carousel-img" :src="item.imageUrl" />
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

<style scoped>
.carousel-img {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  object-fit: scale-down;
}
</style>
