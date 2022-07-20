<script setup lang="ts">
import { h, inject, reactive, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'
import { useRoute } from 'vue-router'

import { NEl, NSkeleton } from 'naive-ui'
import { UseImage } from '@vueuse/components'

import { fixedEncodeURI } from '@/utils/fixedEncodeURI'
import { api } from '@/utils/api'

const columns = [
  {
    title: '封面',
    key: 'image',
    render(row: { picUrl: string }) {
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
                src: `${row.picUrl}?param=64y64`,
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
    title: '专辑',
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
                  default: () => ['（', h('span', null, row.alias), '）'],
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
    title: '歌曲',
    key: 'size',
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
    &type=10`
  )
)
const data = shallowRef()
watch(
  () => url.value,
  () => {
    api.get(url.value).then((res) => {
      data.value = res.data
      pagination.pageCount = Math.ceil(
        data.value.result.albumCount / pagination.pageSize
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
    &type=10`
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
      :data="data?.result.albums"
      :pagination="pagination"
      :loading="loading"
      striped
      :paginate-single-page="false"
      @update-page="onUpdatePage"
    />
  </div>
</template>
