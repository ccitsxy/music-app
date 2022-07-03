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
const { data, onFetchResponse } = useFetch(url, { refetch: true }).json()
onFetchResponse(() => {
  pagination.pageCount = Math.ceil(
    data.value?.result.mvCount / pagination.pageSize
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
    <n-grid :cols="4">
      <n-gi v-for="item in data?.result.mvs" :key="item.id">
        <n-image :src="item.cover" preview-disabled width="300" />
        <div>{{ item.name }}</div>
        <div>
          <template v-for="artist in item.artists" :key="artist.name">
            <span>
              {{ artist.name }}
            </span>
            {{
              item.artists.length - 1 === item.artists.indexOf(artist)
                ? ''
                : '/ '
            }}
          </template>
        </div>
      </n-gi>
    </n-grid>
    <n-pagination
      v-if="pagination.pageCount === 1"
      v-bind="pagination"
      @update-page="onUpdatePage"
    />
  </div>
</template>
