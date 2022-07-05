<script setup lang="ts">
import { reactive, ref, inject } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'

import { useFetch } from '@/composables/useFetch'

const route = useRoute()
const loading = ref(true)
const pagination = reactive({
  showSizePicker: false,
  pageSize: 24,
  page: 1,
  pageCount: 1,
})
const url = ref(
  encodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=0
    &type=1014`
  )
)
const { data, onFetchFinally } = useFetch(url, { refetch: true }).json()
onFetchFinally(() => {
  pagination.pageCount = Math.ceil(
    data.value.result.videoCount / pagination.pageSize
  )
  loading.value = false
})
const layoutContent = inject('layoutContent') as Ref<HTMLElement>
function onUpdatePage(page: number) {
  pagination.page = page
  url.value = encodeURI(
    `/cloudsearch?keywords=${route.params.text}
    &limit=${pagination.pageSize}
    &offset=${(pagination.page - 1) * pagination.pageSize}
    &type=1014`
  )
  loading.value = true
  layoutContent.value.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div>
    <n-spin :show="loading">
      <n-grid cols="3 m:3 xl:4" x-gap="16" y-gap="16" responsive="screen">
        <n-gi v-for="video in data?.result.videos" :key="video.id">
          <n-image
            :src="`${video.coverUrl}?param=320y180`"
            :img-props="{
              class: 'w-full',
            }"
            object-fit="contain"
            preview-disabled
          />
          <n-ellipsis class="font-bold w-72">{{ video.title }}</n-ellipsis>
          <div>
            <template v-for="user in video.creator" :key="user.userId">
              <span>
                {{ user.userName }}
              </span>
              {{
                video.creator.length - 1 === video.creator.indexOf(user)
                  ? ''
                  : '/ '
              }}
            </template>
          </div>
        </n-gi>
      </n-grid>
      <n-pagination
        v-if="pagination.pageCount != 1"
        class="mt-4 justify-end"
        v-bind="pagination"
        @update-page="onUpdatePage"
      />
    </n-spin>
  </div>
</template>
