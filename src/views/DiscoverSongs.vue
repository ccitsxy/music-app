<script setup lang="ts">
import { api } from '@/utils/api'
import { shallowRef } from 'vue'

const data = shallowRef()
api.get('/banner').then((res) => {
  data.value = res.data
})
</script>

<template>
  <div>
    <n-spin :show="!data">
      <n-carousel
        autoplay
        effect="card"
        class="relative h-[200px] w-full"
        prev-slide-style="position: absolute;left: 30rem;opacity: 1"
        next-slide-style="position: absolute;left: unset;right: -3.5rem;opacity: 1"
      >
        <n-carousel-item
          v-for="item in data?.banners"
          :key="item.imageUrl"
          class="!w-[540px]"
        >
          <img class="h-full w-full" :src="item.imageUrl" />
        </n-carousel-item>
      </n-carousel>
    </n-spin>
  </div>
</template>
