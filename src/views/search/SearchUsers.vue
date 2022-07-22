<script setup lang="ts">
import { h, inject, reactive, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'
import { useRoute } from 'vue-router'

import { NSkeleton } from 'naive-ui'
import { UseImage } from '@vueuse/components'

import { fixedEncodeURI } from '@/utils/fixedEncodeURI'
import { api } from '@/utils/api'

const columns = [
  {
    title: '',
    key: 'image',
    render(row: { avatarUrl: string }) {
      return h(
        'div',
        {
          class: 'flex w-16 h-16',
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
                    class: 'flex w-16 h-16',
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
    &type=1002`
  )
)
const data = shallowRef()
watch(
  () => url.value,
  () => {
    api.get(url.value).then((res) => {
      data.value = res.data
      pagination.pageCount = Math.ceil(
        data.value.result.userprofileCount / pagination.pageSize
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
