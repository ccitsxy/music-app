<script setup lang="ts">
import { computed, h, inject, reactive, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'
import { useRoute } from 'vue-router'

import { NEl } from 'naive-ui'
import { useSongStore } from '@/stores/song'
import type { Song } from '@/stores/song'
import { fixedEncodeURI } from '@/utils/fixedEncodeURI'
import { api } from '@/utils/api'

const columns = [
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
      return h(
        'span',
        { class: 'cursor-pointer' },
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
    class: 'cursor-default',
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
const route = useRoute()
const loading = shallowRef(true)
const pagination = reactive({
  showSizePicker: false,
  pageSize: 100,
  page: 1,
  pageCount: 1,
})
const url = shallowRef(
  fixedEncodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=0`
  )
)
const data = shallowRef()
watch(
  () => url.value,
  () => {
    api.get(url.value).then((res) => {
      data.value = res.data
      pagination.pageCount = Math.ceil(
        data.value?.result.songCount / pagination.pageSize
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
    &offset=${(pagination.page - 1) * pagination.pageSize}`
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
      :row-props="rowProps"
      :data="data?.result.songs"
      :pagination="pagination"
      :loading="loading"
      striped
      :paginate-single-page="false"
      @update-page="onUpdatePage"
    />
  </div>
</template>
