<script setup lang="ts">
import { inject, reactive, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'
import { useRoute } from 'vue-router'

import { fixedEncodeURI } from '@/utils/fixedEncodeURI'
import { api } from '@/utils/api'

const route = useRoute()
const loading = shallowRef(true)
const pagination = reactive({
  showSizePicker: false,
  pageSize: 24,
  page: 1,
  pageCount: 1,
})
const url = shallowRef(
  fixedEncodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=0
    &type=1014`
  )
)
const data = shallowRef()
watch(
  () => url.value,
  () => {
    api.get(url.value).then((res) => {
      data.value = res.data
      pagination.pageCount = Math.ceil(
        data.value?.result.videoCount / pagination.pageSize
      )
      setTimeout(() => {
        loading.value = false
      }, 300)
    })
  },
  {
    immediate: true,
  }
)
const layoutContent = inject('layoutContent') as ShallowRef<HTMLElement>
function onUpdatePage(page: number) {
  pagination.page = page
  url.value = fixedEncodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=${(pagination.page - 1) * pagination.pageSize}
    &type=1014`
  )
  loading.value = true
  layoutContent.value.scrollTo({ top: 0, behavior: 'smooth' })
}
const theme = inject('theme')
</script>

<template>
  <div>
    <n-grid cols="3 m:3 xl:4" x-gap="16" y-gap="16" responsive="screen">
      <template v-if="loading">
        <n-gi v-for="item in 24" :key="item" class="space-y-1 pb-[4.4px]">
          <img
            v-if="theme"
            src="@/assets/skeleton-dark.png"
            class="w-full object-scale-down"
          />
          <img
            v-else
            src="@/assets/skeleton.png"
            class="w-full object-scale-down"
          />
          <n-skeleton class="flex h-4 w-60" />
          <n-skeleton class="flex h-4 w-60" />
        </n-gi>
      </template>
      <n-gi v-for="video in data?.result.videos" :key="video.id">
        <div class="w-full">
          <use-image :src="`${video.coverUrl}?param=320y180`">
            <img
              :src="`${video.coverUrl}?param=320y180`"
              class="w-full object-scale-down"
            />
            <template #loading>
              <img
                v-if="theme"
                src="@/assets/skeleton-dark.png"
                class="w-full object-scale-down"
              />
              <img
                v-else
                src="@/assets/skeleton.png"
                class="w-full object-scale-down"
              />
            </template>
          </use-image>
        </div>
        <n-ellipsis class="w-60 font-bold">{{ video.title }}</n-ellipsis>
        <div>
          <template v-for="user in video.creator" :key="user.userId">
            <span>
              {{ user.userName }}
            </span>
            {{
              video.creator.length - 1 === video.creator.indexOf(user)
                ? ''
                : '/ '
            }}
          </template>
        </div>
      </n-gi>
    </n-grid>
    <n-pagination
      v-if="pagination.pageCount !== 1"
      class="mt-4 justify-center"
      v-bind="pagination"
      @update-page="onUpdatePage"
    />
  </div>
</template>
