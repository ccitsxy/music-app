<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useFetch } from '@vueuse/core'
import { h, inject, reactive, ref } from 'vue'
import type { Ref } from 'vue'
import { NEl } from 'naive-ui'

const columns = [
  {
    title: '封面',
    key: 'image',
    render(row: { picUrl: string }) {
      return h('img', {
        src: `${row.picUrl}?param=256y256`,
        height: 64,
        width: 64,
      })
    },
    width: 100,
  },
  {
    title: '专辑',
    key: 'name',
    render(row: { name: string; alias: string[] }) {
      if (row.alias.length) {
        return h(
          'span',
          {
            style: { cursor: 'pointer' },
          },
          {
            default: () => [
              row.name,
              h(
                NEl,
                {
                  tag: 'span',
                  style: { color: 'var(--text-color-3)' },
                },
                {
                  default: () => ['（', h('span', null, row.alias), '）'],
                }
              ),
            ],
          }
        )
      } else {
        return h(
          'span',
          { style: { cursor: 'pointer' } },
          {
            default: () => row.name,
          }
        )
      }
    },
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '歌曲总数',
    key: 'size',
    width: 100,
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
    `https://music.ccitsxy.vercel.app/cloudsearch?keywords=${
      route.params.text
    }&limit=${pagination.pageSize}&offset=${
      (pagination.page - 1) * pagination.pageSize
    }&type=10`
  )
)
const { data, onFetchResponse } = useFetch(url, { refetch: true }).json()
onFetchResponse(() => {
  pagination.pageCount = Math.ceil(
    data.value?.result?.albumCount / pagination.pageSize
  )
  loading.value = false
})
const layoutContent = inject<Ref<HTMLElement>>('layoutContent')
function onUpdatePage(page: number) {
  pagination.page = page
  url.value = encodeURI(
    `https://music.ccitsxy.vercel.app/cloudsearch?keywords=${
      route.params.text
    }&limit=${pagination.pageSize}&offset=${
      (pagination.page - 1) * pagination.pageSize
    }&type=10`
  )
  loading.value = true
  layoutContent?.value.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
<template>
  <div>
    <n-data-table
      remote
      :columns="columns"
      :data="data?.result?.albums"
      :pagination="pagination"
      :loading="loading"
      striped
      @update-page="onUpdatePage"
    />
  </div>
</template>
