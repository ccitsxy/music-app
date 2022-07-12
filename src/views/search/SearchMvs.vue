<script setup lang="ts">
import { reactive, ref, inject } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'

import { useFetch } from '@/composables/useFetch'
import { fixedEncodeURI } from '@/utils/fixedEncodeURI'

const route = useRoute()
const loading = ref(true)
const pagination = reactive({
  showSizePicker: false,
  pageSize: 24,
  page: 1,
  pageCount: 1,
})
const url = ref(
  fixedEncodeURI(
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
  setTimeout(() => {
    loading.value = false
  }, 300)
})
const layoutContent = inject('layoutContent') as Ref<HTMLElement>
function onUpdatePage(page: number) {
  pagination.page = page
  url.value = fixedEncodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=${(pagination.page - 1) * pagination.pageSize}
    &type=1004`
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
        <template v-if="loading">
          <n-gi v-for="item in 24" :key="item" class="space-y-1 pb-4.4px">
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
            <n-skeleton class="h-4 w-60 flex" />
            <n-skeleton class="h-4 w-60 flex" />
          </n-gi>
        </template>
      </template>
      <n-gi v-for="mv in data?.result.mvs" :key="mv.id">
        <div class="w-full">
          <use-image :src="`${mv.cover}?param=320y180`">
            <img
              :src="`${mv.cover}?param=320y180`"
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
        <n-ellipsis class="font-bold w-60">{{ mv.name }}</n-ellipsis>
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
      class="mt-4 justify-center"
      v-bind="pagination"
      @update-page="onUpdatePage"
    />
  </div>
</template>
