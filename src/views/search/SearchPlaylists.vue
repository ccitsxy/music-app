<script setup lang="ts">
import { h, inject, reactive, ref } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'

import { useFetch } from '@/composables/useFetch'

const columns = [
  {
    title: '封面',
    key: 'image',
    render(row: { coverImgUrl: string }) {
      return h('img', {
        src: `${row.coverImgUrl}?param=256y256`,
        height: 64,
        width: 64,
      })
    },
    width: 100,
  },
  {
    title: '标题',
    key: 'name',
    render(row: { name: string; alias: string[] }) {
      return h(
        'span',
        { class: 'cursor-pointer' },
        {
          default: () => row.name,
        }
      )
    },
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '歌曲',
    key: 'trackCount',
    width: 100,
  },
  {
    title: '创建者',
    key: 'creator.nickname',
  },
  {
    title: '播放',
    key: 'playCount',
    width: 200,
  },
]
const route = useRoute()
const loading = ref(true)
const pagination = reactive({
  showSizePicker: false,
  pageSize: 20,
  page: 1,
  pageCount: 1,
})
const url = ref(
  encodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=0
    &type=1000`
  )
)
const { data, onFetchFinally } = useFetch(url, { refetch: true }).json()
onFetchFinally(() => {
  pagination.pageCount = Math.ceil(
    data.value?.result.playlistCount / pagination.pageSize
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
    &type=1000`
  )
  loading.value = true
  layoutContent.value.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
<template>
  <div>
    <n-data-table
      remote
      :columns="columns"
      :data="data?.result.playlists"
      :pagination="pagination"
      :loading="loading"
      striped
      @update-page="onUpdatePage"
    />
  </div>
</template>
