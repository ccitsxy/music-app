<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useSongStore } from '@/stores/song'

import type { MenuOption } from 'naive-ui'
import { useEventListener, useMediaControls, useTitle } from '@vueuse/core'

const menuOptions: MenuOption[] = [
  {
    label: '发现音乐',
    key: '/discover',
  },
]
const router = useRouter()
function updateValue(key: string) {
  router.push(key)
}
const src = ref('')
const audio = ref<HTMLMediaElement>()
const { playing, currentTime, duration, volume, buffered, muted } =
  useMediaControls(audio, {
    src: src,
  })
function formatDuration(duration: number) {
  let minutes = Math.floor(duration / 60).toString()
  if (minutes.length === 1) minutes = `0${minutes}`
  let seconds = Math.floor(duration % 60).toString()
  if (seconds.length === 1) seconds = `0${seconds}`
  return `${minutes}:${seconds}`
}
const endBuffer = computed(() =>
  buffered.value.length > 0 ? buffered.value[buffered.value.length - 1][1] : 0
)
useEventListener(audio, 'loadstart', () => {
  playing.value = false
})
useEventListener(audio, 'loadeddata', () => {
  playing.value = true
})
const layoutContent = ref<HTMLElement>()
provide('layoutContent', layoutContent)
const { songs, addIndex, decIndex } = useSongStore()
const currentIndex = computed(() => useSongStore().currentIndex)
watch(
  () => currentIndex.value,
  () => {
    src.value = songs[currentIndex.value - 1].src
    audio.value?.load()
    useTitle(songs[currentIndex.value - 1].name)
  }
)
const showSongList = ref(false)
</script>

<template>
  <n-layout class="h-[calc(100vh-4rem)]">
    <n-layout class="h-[calc(100vh-9rem)]" has-sider>
      <n-layout-sider width="12.5rem" bordered>
        <n-menu
          :value="$route.path"
          :options="menuOptions"
          @update-value="updateValue"
        />
      </n-layout-sider>
      <n-layout-content ref="layoutContent" content-style="padding: 24px">
        <router-view v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath" />
        </router-view>
      </n-layout-content>
    </n-layout>
    <n-layout-footer
      bordered
      class="h-20 flex items-center bg-transparent px-2"
    >
      <div
        v-if="currentIndex"
        class="flex items-center absolute left-0 bottom-68px w-screen z-10"
      >
        <slide-scrubber
          v-model="currentTime"
          :max="duration"
          :secondary="endBuffer"
          class="flex w-full"
        />
      </div>
      <n-grid class="h-full" :cols="5">
        <n-gi span="2" class="flex items-center">
          <img
            v-if="songs[currentIndex - 1]?.picUrl"
            width="64"
            height="64"
            :src="`${songs[currentIndex - 1]?.picUrl}?param=256y256`"
            class="flex mr-2"
          />
          <div>
            <n-ellipsis class="flex items-center flex-row mr-4 w-25vw">
              <span class="font-bold">
                {{ songs[currentIndex - 1]?.name }}
              </span>
              <n-el v-if="songs[currentIndex - 1]?.alia[0]" tag="span">
                （{{ songs[currentIndex - 1]?.alia[0] }}）
              </n-el>
            </n-ellipsis>
            <div class="flex items-center mr-4">
              <span>
                <template
                  v-for="item in songs[currentIndex - 1]?.artists"
                  :key="item.id"
                >
                  <span>{{ item?.name }}</span>
                  {{
                    songs[currentIndex - 1]?.artists.length - 1 ===
                    songs[currentIndex - 1]?.artists.indexOf(item)
                      ? ''
                      : ' / '
                  }}
                </template>
              </span>
            </div>
          </div>
        </n-gi>
        <n-gi span="1" class="flex items-center justify-center">
          <audio ref="audio" />
          <span class="flex mr-2"></span>
          <n-button
            quaternary
            :focusable="false"
            @click="decIndex()"
            :disabled="currentIndex <= 1"
          >
            <i-bi-skip-start-fill />
          </n-button>
          <n-button
            secondary
            :focusable="false"
            circle
            :disabled="songs.length === 0"
            size="large"
            class="mx-4"
            @click="playing = !playing"
          >
            <i-carbon-pause-filled v-if="playing" />
            <i-carbon-play-filled-alt v-else />
          </n-button>
          <n-button
            quaternary
            :focusable="false"
            :disabled="currentIndex === songs.length || songs.length === 0"
            @click="addIndex()"
          >
            <i-bi-skip-end-fill />
          </n-button>
        </n-gi>
        <n-gi span="2" class="flex items-center justify-end">
          <span v-if="currentIndex" class="flex mr-2">
            {{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}
          </span>
          <n-button
            quaternary
            :focusable="false"
            ref="trigger"
            @click="muted = !muted"
          >
            <i-carbon-volume-mute v-if="muted || volume === 0" />
            <i-carbon-volume-up v-else />
          </n-button>
          <n-slider
            v-model:value="volume"
            ref="slider"
            :step="0.01"
            :max="1"
            :disabled="muted"
            :format-tooltip="(value: number) => {
              return Math.floor(value * 100)
            }"
            class="w-30 mx-2"
          />
          <n-button quaternary :focusable="false" @click="showSongList = true">
            <i-ph-playlist />
          </n-button>
        </n-gi>
      </n-grid>
    </n-layout-footer>
  </n-layout>
</template>
