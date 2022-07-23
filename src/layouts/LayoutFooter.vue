<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'

import { useSongStore } from '@/stores/song'

import { useEventListener, useMediaControls, useTitle } from '@vueuse/core'

const src = shallowRef('')
const audio = shallowRef<HTMLMediaElement>()
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
const showSongList = shallowRef(false)
</script>

<template>
  <div
    v-if="currentIndex"
    class="absolute left-0 bottom-[68px] z-10 flex w-screen items-center"
  >
    <stack-slider
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
        :src="`${songs[currentIndex - 1]?.picUrl}?param=64y64`"
        class="mr-2 flex"
      />
      <div>
        <n-ellipsis class="mr-4 flex w-[25vw] flex-row items-center">
          <span>
            {{ songs[currentIndex - 1]?.name }}
          </span>
          <n-el
            v-if="songs[currentIndex - 1]?.alia[0]"
            tag="span"
            class="opacity-75"
          >
            （{{ songs[currentIndex - 1]?.alia[0] }}）
          </n-el>
        </n-ellipsis>
        <div class="mr-4 flex items-center">
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
      <span class="mr-2 flex"></span>
      <n-button
        quaternary
        :focusable="false"
        :native-focus-behavior="false"
        @click="decIndex()"
        :disabled="currentIndex <= 1"
      >
        <i-bi-skip-start-fill />
      </n-button>
      <n-button
        secondary
        :focusable="false"
        :native-focus-behavior="false"
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
        :native-focus-behavior="false"
        :disabled="currentIndex === songs.length || songs.length === 0"
        @click="addIndex()"
      >
        <i-bi-skip-end-fill />
      </n-button>
    </n-gi>
    <n-gi span="2" class="flex items-center justify-end">
      <span v-if="currentIndex" class="mr-2 flex">
        {{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}
      </span>
      <n-button
        quaternary
        :focusable="false"
        :native-focus-behavior="false"
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
        class="mx-2 w-32"
      />
      <n-button
        quaternary
        :focusable="false"
        :native-focus-behavior="false"
        @click="showSongList = true"
      >
        <i-ph-playlist />
      </n-button>
    </n-gi>
  </n-grid>
</template>
