<script setup lang="ts">
import { h, inject, reactive, ref } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'

import { NEl, NSkeleton } from 'naive-ui'
import { UseImage } from '@vueuse/components'
import { useFetch } from '@/composables/useFetch'
import { fixedEncodeURI } from '@/utils/fixedEncodeURI'

const columns = [
  {
    title: '',
    key: 'image',
    render(row: { img1v1Url: string }) {
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
                src: `${row.img1v1Url}?param=256y256`,
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
    title: '歌手',
    key: 'name',
    render(row: { name: string; alias: string[] }) {
      if (row.alias.length) {
        return h(
          'span',
          {
            class: 'cursor-pointer',
          },
          {
            default: () => [
              row.name,
              h(
                NEl,
                {
                  tag: 'span',
                  class: 'opacity-75',
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
          { class: 'cursor-pointer' },
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
    title: '专辑',
    key: 'albumSize',
    width: 100,
  },
  {
    title: 'MV',
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
  fixedEncodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=0
    &type=100`
  )
)
const { data, onFetchFinally } = useFetch(url, { refetch: true }).json()
onFetchFinally(() => {
  pagination.pageCount = Math.ceil(
    data.value.result.artistCount / pagination.pageSize
  )
  loading.value = false
})
const layoutContent = inject('layoutContent') as Ref<HTMLElement>
function onUpdatePage(page: number) {
  pagination.page = page
  url.value = fixedEncodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=${(pagination.page - 1) * pagination.pageSize}
    &type=100`
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
      :data="data?.result.artists"
      :pagination="pagination"
      :loading="loading"
      striped
      :paginate-single-page="false"
      @update-page="onUpdatePage"
    />
  </div>
</template>
