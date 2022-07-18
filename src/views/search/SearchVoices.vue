<script setup lang="ts">
import { h, inject, reactive, ref } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'

import { NSkeleton } from 'naive-ui'
import { UseImage } from '@vueuse/components'

import { useFetch } from '@/composables/useFetch'
import { fixedEncodeURI } from '@/utils/fixedEncodeURI'

const columns = [
  {
    title: '封面',
    key: 'image',
    render(row: {
      uiElement: {
        image: {
          imageUrl: string
        }
      }
    }) {
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
                src: `${row.uiElement.image.imageUrl}?param=64y64`,
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
    render(row: {
      baseInfo: {
        mainSong: {
          name: string
        }
      }
    }) {
      return h(
        'span',
        {
          class: 'cursor-pointer',
        },
        {
          default: () => row.baseInfo.mainSong.name,
        }
      )
    },
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '播放',
    key: 'baseInfo.listenerCount',
    width: 100,
  },
  {
    title: '时长',
    key: 'duration',
    width: 100,
    render(row: {
      baseInfo: {
        mainSong: {
          duration: number
        }
      }
    }) {
      let minutes = Math.floor(
        ((row.baseInfo.mainSong.duration / 1000) % 3600) / 60
      ).toString()
      if (minutes.length === 1) minutes = `0${minutes}`
      let seconds = Math.floor(
        (row.baseInfo.mainSong.duration / 1000) % 60
      ).toString()
      if (seconds.length === 1) seconds = `0${seconds}`
      return h('span', null, {
        default: () => `${minutes}:${seconds}`,
      })
    },
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '歌手',
    key: 'dj',
    width: 200,
    render(row: {
      baseInfo: {
        dj: {
          nickname: string
        }
      }
    }) {
      return h(
        'span',
        {
          class: 'cursor-pointer',
        },
        {
          default: () => row.baseInfo.dj.nickname,
        }
      )
    },
    ellipsis: {
      tooltip: true,
    },
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
  fixedEncodeURI(
    `/search?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=0
    &type=2000`
  )
)
const { data, onFetchFinally } = useFetch(url, { refetch: true }).json()
onFetchFinally(() => {
  pagination.pageCount = Math.ceil(
    data.value.data.totalCount / pagination.pageSize
  )
  loading.value = false
})
const layoutContent = inject('layoutContent') as Ref<HTMLElement>
function onUpdatePage(page: number) {
  pagination.page = page
  url.value = fixedEncodeURI(
    `/search?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=${(pagination.page - 1) * pagination.pageSize}
    &type=2000`
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
      :data="data?.data.resources"
      :pagination="pagination"
      :loading="loading"
      striped
      :paginate-single-page="false"
      @update-page="onUpdatePage"
    />
  </div>
</template>
