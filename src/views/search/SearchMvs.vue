<script setup lang="ts">
import { reactive, ref, inject } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'

import { useFetch } from '@/composables/useFetch'

const route = useRoute()
const loading = ref(true)
const pagination = reactive({
  showSizePicker: false,
  pageSize: 24,
  page: 1,
  pageCount: 1,
})
const url = ref(
  encodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=0
    &type=1004`
  )
)
const { data, onFetchFinally } = useFetch(url, { refetch: true }).json()
onFetchFinally(() => {
  pagination.pageCount = Math.ceil(
    data.value.result.mvCount / pagination.pageSize
  )
  loading.value = false
})
const layoutContent = inject('layoutContent') as Ref<HTMLElement>
function onUpdatePage(page: number) {
  pagination.page = page
  url.value = encodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=${(pagination.page - 1) * pagination.pageSize}
    &type=1004`
  )
  loading.value = true
  layoutContent.value.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div>
    <n-spin :show="loading">
      <n-grid
        id="image-scroll-container"
        cols="3 m:3 xl:4"
        x-gap="16"
        y-gap="16"
        responsive="screen"
      >
        <n-gi v-for="mv in data?.result.mvs" :key="mv.id">
          <use-image :src="`${mv.cover}?param=320y180`">
            <img
              :src="`${mv.cover}?param=320y180`"
              class="w-full object-contain"
            />
            <template #loading>
              <n-skeleton class="w-320px h-180px" />
            </template>
          </use-image>
          <n-ellipsis class="font-bold w-72">{{ mv.name }}</n-ellipsis>
          <div>
            <template v-for="artist in mv.artists" :key="artist.name">
              <span>
                {{ artist.name }}
              </span>
              {{
                mv.artists.length - 1 === mv.artists.indexOf(artist) ? '' : '/ '
              }}
            </template>
          </div>
        </n-gi>
      </n-grid>
      <n-pagination
        v-if="pagination.pageCount != 1"
        class="mt-4 justify-end"
        v-bind="pagination"
        @update-page="onUpdatePage"
      />
    </n-spin>
  </div>
</template>
