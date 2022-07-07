<script setup lang="ts">
import { h, inject, reactive, ref } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'

import { useFetch } from '@/composables/useFetch'

const columns = [
  // {
  //   title: '封面',
  //   key: 'image',
  //   render(row: { picUrl: string }) {
  //     return h('img', {
  //       src: `${row.picUrl}?param=256y256`,
  //       height: 64,
  //       width: 64,
  //     })
  //   },
  //   width: 100,
  // },
  // {
  //   title: '专辑',
  //   key: 'name',
  //   render(row: { name: string }) {
  //     return h(
  //       'span',
  //       { style: { cursor: 'pointer' } },
  //       {
  //         default: () => row.name,
  //       }
  //     )
  //   },
  //   ellipsis: {
  //     tooltip: true,
  //   },
  // },
  // {
  //   title: '播放',
  //   key: 'playCount',
  //   width: 100,
  // },
  {
    title: '歌手',
    key: 'dj',
    render(row: {
      uiElement: {
        mainTitle: {
          title: string
        }
      }
    }) {
      return h(
        'span',
        {
          style: {
            cursor: 'pointer',
          },
        },
        {
          default: () => row.uiElement.mainTitle.title.slice(3),
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
  encodeURI(
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
  url.value = encodeURI(
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
