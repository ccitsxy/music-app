<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useFetch } from '@vueuse/core'
import { h, inject, reactive, ref } from 'vue'
import type { Ref } from 'vue'
import { NEl } from 'naive-ui'

const columns = [
  {
    title: '头像',
    key: 'image',
    render(row: { img1v1Url: string }) {
      return h('img', {
        src: `${row.img1v1Url}?param=256y256`,
        height: 64,
        width: 64,
      })
    },
    width: 100,
  },
  {
    title: '歌手',
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
                  default: () => ['（', h('span', null, row.alias[0]), '）'],
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
    title: '专辑总数',
    key: 'albumSize',
    width: 100,
  },
  {
    title: 'MV总数',
    key: 'mvSize',
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
    }&limit=${pagination.pageSize}&offset=${pagination.page - 1}&type=100`
  )
)
const { data, onFetchResponse } = useFetch(url, { refetch: true }).json()
onFetchResponse(() => {
  pagination.pageCount = Math.ceil(
    data.value?.result?.artistCount / pagination.pageSize
  )
  loading.value = false
})
const layoutContent = inject<Ref<HTMLElement>>('layoutContent')
function onUpdatePage(page: number) {
  pagination.page = page
  url.value = encodeURI(
    `https://music.ccitsxy.vercel.app/cloudsearch?keywords=${
      route.params.text
    }&limit=${pagination.pageSize}&offset=${pagination.page - 1}&type=100`
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
      :data="data?.result?.artists"
      :pagination="pagination"
      :loading="loading"
      striped
      :paginate-single-page="false"
      @update-page="onUpdatePage"
    />
  </div>
</template>
