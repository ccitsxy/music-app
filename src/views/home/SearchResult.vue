<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useFetch } from '@vueuse/core'
import { h, reactive, ref } from 'vue'
import { NEl } from 'naive-ui'

const columns = [
  {
    title: '音乐标题',
    key: 'name',
    render(row: { name: string; alia: string[] }) {
      if (row.alia.length) {
        return h(
          'span',
          { style: { cursor: 'pointer' } },
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
                  default: () => ['（', h('span', null, row.alia), '）'],
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
    title: '歌手',
    key: 'ar',
    render(row: { ar: [{ name: string }] }) {
      return row.ar.map((element) => {
        return [
          h(
            'span',
            {
              style: {
                margin: '0 4px',
                cursor: 'pointer',
              },
            },
            {
              default: () => element.name,
            }
          ),
          row.ar.length - 1 === row.ar.indexOf(element) ? '' : '/',
        ]
      })
    },
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '专辑',
    key: 'al',
    render(row: { al: { name: string } }) {
      return h(
        'span',
        { style: { cursor: 'pointer' } },
        {
          default: () => row.al.name,
        }
      )
    },
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '时长',
    key: 'dt',
    render(row: { dt: number }) {
      let minutes = Math.floor(((row.dt / 1000) % 3600) / 60).toString()
      if (minutes.length === 1) minutes = `0${minutes}`
      let seconds = Math.floor((row.dt / 1000) % 60).toString()
      if (seconds.length === 1) seconds = `0${seconds}`
      return h('span', null, {
        default: () => `${minutes}:${seconds}`,
      })
    },
    width: 100,
  },
]
const route = useRoute()
const loading = ref(true)
const pagination = reactive({
  showSizePicker: false,
  pageSize: 100,
  page: 1,
  pageCount: 1,
})
const url = ref(
  encodeURI(
    `https://music.ccitsxy.vercel.app/cloudsearch?keywords=${
      route.params.text
    }&limit=${pagination.pageSize as number}&offset=${
      (pagination.page as number) - 1
    }`
  )
)
const { data, onFetchResponse } = useFetch(url, { refetch: true }).json()
onFetchResponse(() => {
  pagination.pageCount = Math.ceil(
    data.value?.result?.songCount / pagination.pageSize
  )
  loading.value = false
})
function onUpdatePage(page: number) {
  pagination.page = page
  url.value = encodeURI(
    `https://music.ccitsxy.vercel.app/cloudsearch?keywords=${
      route.params.text
    }&limit=${pagination.pageSize as number}&offset=${
      (pagination.page as number) - 1
    }`
  )
  loading.value = true
}
</script>
<template>
  <div>
    <div class="font-bold text-xl">搜索&nbsp;{{ $route.params.text }}</div>
    <div class="text-xs mt-8 mb-2">你可能感兴趣</div>
    <n-card size="small" embedded class="mb-8 w-80"> </n-card>
    <div>找到{{ data?.result?.songCount }}首单曲</div>
    <n-data-table
      remote
      size="small"
      :columns="columns"
      :data="data?.result?.songs"
      :pagination="pagination"
      :loading="loading"
      striped
      @update-page="onUpdatePage"
    />
    <n-back-top :bottom="140" :right="20" />
  </div>
</template>
