<script setup lang="ts">
import { useFetch } from '@vueuse/core'
import { useRoute } from 'vue-router'

const route = useRoute()
const { data } = useFetch(
  encodeURI(
    `https://music.ccitsxy.vercel.app/search/multimatch?keywords=${route.params.text}`
  )
).json()
</script>
<template>
  <div>
    <n-grid x-gap="12" :cols="2" class="mb-4">
      <n-gi v-for="item in data?.result?.artist" :key="item.id">
        <n-card embedded content-style="display:flex;padding:12px;">
          <img
            :src="`${item.img1v1Url}?param=256y256`"
            width="48"
            height="48"
            class="flex mr-2"
          />
          <div class="flex-row">
            <div class="flex">
              <span> 歌手：{{ item.name }} </span>
              <n-el v-if="item.alias.length" class="text-$text-color-3">
                （{{ item.alias[0] }}）
              </n-el>
            </div>
            <div class="flex">
              粉丝：{{ item.fansSize }}，歌曲：{{ item.musicSize }}
            </div>
          </div>
        </n-card>
      </n-gi>

      <n-gi v-for="item in data?.result?.playlist" :key="item.id">
        <n-card embedded content-style="display:flex;padding:12px">
          <img
            :src="`${item.coverImgUrl}?param=256y256`"
            width="48"
            height="48"
            class="flex mr-2"
          />
          <div class="flex-row">
            <div class="flex">歌单：{{ item.name }}</div>
            <div class="flex">
              歌曲：{{ item.trackCount }}，播放：{{ item.playCount }}
            </div>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-tabs>
      <n-tab-pane name="single" tab="单曲">
        <keep-alive>
          <search-songs />
        </keep-alive>
      </n-tab-pane>
      <n-tab-pane name="singer" tab="歌手">
        <keep-alive>
          <search-artists />
        </keep-alive>
      </n-tab-pane>
      <n-tab-pane name="album" tab="专辑">
        <keep-alive>
          <search-albums />
        </keep-alive>
      </n-tab-pane>
    </n-tabs>
    <!-- <n-back-top :bottom="140" :right="20" /> -->
  </div>
</template>
