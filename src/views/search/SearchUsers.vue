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
    title: '',
    key: 'image',
    render(row: { avatarUrl: string }) {
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
                src: `${row.avatarUrl}?param=64y64`,
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
    title: '用户名',
    key: 'name',
    render(row: { nickname: string; alias: string[] }) {
      return h(
        'span',
        { class: 'cursor-pointer' },
        {
          default: () => row.nickname,
        }
      )
    },
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '',
    key: 'description',
    width: 300,
    render(row: { description: string; signature: string[]; vipType: string }) {
      return h(
        'span',
        { class: 'cursor-pointer' },
        {
          default: () => (row.description ? row.description : row.signature),
        }
      )
    },
  },
  {
    title: '',
    key: 'vip',
    width: 300,
    render(row: { djStatus: string[] }) {
      return h(
        'span',
        { class: 'cursor-pointer' },
        {
          default: () => (row.djStatus ? '网易音乐人' : ''),
        }
      )
    },
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
    &type=1002`
  )
)
const { data, onFetchFinally } = useFetch(url, { refetch: true }).json()
onFetchFinally(() => {
  pagination.pageCount = Math.ceil(
    data.value.result.userprofileCount / pagination.pageSize
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
    &type=1002`
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
      :data="data?.result.userprofiles"
      :pagination="pagination"
      :loading="loading"
      striped
      :paginate-single-page="false"
      @update-page="onUpdatePage"
    />
  </div>
</template>
