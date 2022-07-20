<script setup lang="ts">
import { h, inject, reactive, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'
import { useRoute } from 'vue-router'

import { NSkeleton } from 'naive-ui'
import { UseImage } from '@vueuse/components'

import { fixedEncodeURI } from '@/utils/fixedEncodeURI'
import { api } from '@/utils/api'

const columns = [
  {
    title: '封面',
    key: 'image',
    render(row: { coverImgUrl: string }) {
      return h(
        'div',
        {
          class: 'w-16 h-16 flex',
        },
        {
          default: () => [
            h(
              UseImage,
              {
                src: `${row.coverImgUrl}?param=64y64`,
              },
              {
                loading: () =>
                  h(NSkeleton, {
                    class: 'w-16 h-16 flex',
                  }),
              }
            ),
          ],
        }
      )
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
    width: 100,
  },
]
const route = useRoute()
const loading = shallowRef(true)
const pagination = reactive({
  showSizePicker: false,
  pageSize: 20,
  page: 1,
  pageCount: 1,
})
const url = shallowRef(
  fixedEncodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=0
    &type=1000`
  )
)
const data = shallowRef()
watch(
  () => url.value,
  () => {
    api.get(url.value).then((res) => {
      data.value = res.data
      pagination.pageCount = Math.ceil(
        data.value?.result.playlistCount / pagination.pageSize
      )
      loading.value = false
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
      :paginate-single-page="false"
      @update-page="onUpdatePage"
    />
  </div>
</template>
