<script setup lang="ts">
import { computed, h, inject, reactive, ref, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'
import { useRoute } from 'vue-router'

import { NEl } from 'naive-ui'
import { useSongStore } from '@/stores/song'
import type { Song } from '@/stores/song'
import { fixedEncodeURI } from '@/utils/fixedEncodeURI'
import { api } from '@/utils/api'

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
                class: 'opacity-75',
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
              class: 'cursor-pointer',
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
    class: 'cursor-pointer',
    onDblclick: () => {
      api.get(`/song/url?id=${row.id}`).then((res) => {
        song.src = res.data.data[0].url
        api.get(`/song/detail?ids=${row.id}`).then((res) => {
          song.name = res.data.songs[0].name
          song.picUrl = res.data.songs[0].al.picUrl
          song.artists = res.data.songs[0].ar
          song.alia = res.data.songs[0].alia
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
    &type=1006`
  )
)
const expandedRowKeys = ref<string[]>([])
const data = shallowRef()
watch(
  () => url.value,
  () => {
    api.get(url.value).then((res) => {
      data.value = res.data
      pagination.pageCount = Math.ceil(
        data.value.result.songCount / pagination.pageSize
      )
      loading.value = false
      if (data.value.result.songs)
        data.value.result.songs.forEach((element: { id: string }) =>
          expandedRowKeys.value.push(element.id)
        )
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
      :expanded-row-keys="expandedRowKeys"
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
