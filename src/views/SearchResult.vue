<script setup lang="ts">
import { useRoute } from 'vue-router'

import { useFetch } from '@/composables/useFetch'
import { fixedEncodeURI } from '@/utils/fixedEncodeURI'

const route = useRoute()

const { data } = useFetch(
  fixedEncodeURI(`/search/multimatch?keywords=${route.params.text}`)
).json()
</script>
<template>
  <div>
    <n-grid x-gap="12" :cols="2">
      <n-gi v-for="item in data?.result?.artist" :key="item.id">
        <n-card
          class="mb-4"
          embedded
          content-style="display: flex;padding: 12px;height: 48px"
        >
          <div class="w-12 h-12 flex mr-2">
            <use-image :src="`${item.img1v1Url}?param=256y256`">
              <template #loading>
                <n-skeleton class="w-12 h-12 flex" />
              </template>
            </use-image>
          </div>
          <div class="flex-row">
            <div class="flex">
              <span> 歌手：{{ item.name }} </span>
              <n-el v-if="item.alias.length" class="opacity-75">
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
          <div class="w-12 h-12 flex mr-2">
            <use-image :src="`${item.coverImgUrl}?param=256y256`">
              <template #loading>
                <n-skeleton class="w-12 h-12 flex mr-2" />
              </template>
            </use-image>
          </div>
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
      <n-tab-pane name="song" tab="单曲">
        <search-songs />
      </n-tab-pane>
      <n-tab-pane name="singer" tab="歌手">
        <search-artists />
      </n-tab-pane>
      <n-tab-pane name="album" tab="专辑">
        <search-albums />
      </n-tab-pane>
      <n-tab-pane name="mv" tab="MV">
        <search-mvs />
      </n-tab-pane>
      <n-tab-pane name="video" tab="视频">
        <search-videos />
      </n-tab-pane>
      <n-tab-pane name="playlist" tab="歌单">
        <search-playlists />
      </n-tab-pane>
      <n-tab-pane name="lyric" tab="歌词">
        <search-lyrics />
      </n-tab-pane>
      <n-tab-pane name="djRadio" tab="播客">
        <search-dj-radios />
      </n-tab-pane>
      <n-tab-pane name="voice" tab="声音">
        <search-voices />
      </n-tab-pane>
      <n-tab-pane name="user" tab="用户">
        <search-users />
      </n-tab-pane>
    </n-tabs>
    <n-back-top :bottom="90" :right="20" />
  </div>
</template>
