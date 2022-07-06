<script setup lang="ts">
import { computed, h, inject, reactive, ref } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'

import { NEl } from 'naive-ui'
import { useSongStore } from '@/stores/song'
import type { Song } from '@/stores/song'
import { useFetch } from '@/composables/useFetch'

const columns = [
  {
    type: 'expand',
    width: 0,
    expandable: (row: { lyrics: string }) => row.lyrics !== 'Jim Green',
    renderExpand: (row: { lyrics: string[] }) => {
      return row.lyrics.map((element) => {
        return [
          h('div', {
            innerHTML: element,
          }),
        ]
      })
    },
  },
  {
    title: '标题',
    key: 'name',
    render(row: { name: string; alia: string[] }) {
      if (row.alia.length) {
        return h('span', null, {
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
        })
      } else {
        return h('span', null, {
          default: () => row.name,
        })
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
                cursor: 'pointer',
              },
            },
            {
              default: () => element.name,
            }
          ),
          row.ar.length - 1 === row.ar.indexOf(element) ? '' : ' / ',
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
      return h('span', null, {
        default: () => row.al.name,
      })
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
const { songs, addIndex } = useSongStore()
const currentIndex = computed(() => useSongStore().currentIndex)
const rowProps = (row: { id: string }) => {
  const song: Song = {
    src: '',
    name: '',
    alia: [],
    picUrl: '',
    artists: [],
  }
  return {
    style: 'cursor: default;',
    onDblclick: () => {
      useFetch(`/song/url?id=${row.id}`)
        .json()
        .then((result) => {
          song.src = result.data.value.data[0].url
          useFetch(`/song/detail?ids=${row.id}`)
            .json()
            .then((result) => {
              song.name = result.data.value.songs[0].name
              song.picUrl = result.data.value.songs[0].al.picUrl
              song.artists = result.data.value.songs[0].ar
              song.alia = result.data.value.songs[0].alia
              songs.splice(currentIndex.value, 0, song)
              addIndex()
            })
        })
    },
  }
}
function rowKey(rowData: { id: number }) {
  return rowData.id
}
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
    &type=1006`
  )
)
const a = ref<string[]>([])
const { data, onFetchFinally } = useFetch(url, { refetch: true }).json()
onFetchFinally(() => {
  pagination.pageCount = Math.ceil(
    data.value.result.songCount / pagination.pageSize
  )
  loading.value = false
  if (data.value.result.songs)
    data.value.result.songs.forEach((element: { id: string }) =>
      a.value.push(element.id)
    )
})
const layoutContent = inject('layoutContent') as Ref<HTMLElement>
function onUpdatePage(page: number) {
  pagination.page = page
  url.value = encodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=${(pagination.page - 1) * pagination.pageSize}
    &type=1006`
  )
  loading.value = true
  layoutContent.value.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
<template>
  <div class="search-lyrics">
    <n-data-table
      remote
      :columns="(columns as any)"
      :row-props="rowProps"
      :row-key="rowKey"
      :data="data?.result.songs"
      :pagination="pagination"
      :loading="loading"
      :expanded-row-keys="a"
      striped
      :paginate-single-page="false"
      @update-page="onUpdatePage"
    />
  </div>
</template>

<style scoped>
.search-lyrics :deep(.n-data-table-expand-trigger) {
  display: none;
}
</style>
