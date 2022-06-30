<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { MenuOption } from 'naive-ui'
import { useMediaControls, useTitle } from '@vueuse/core'

import { useSongStore } from '@/stores/song'

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
const layoutContent = ref<HTMLElement>()
provide('layoutContent', layoutContent)
const { songs } = useSongStore()
const currentIndex = computed(() => useSongStore().currentIndex)
watch(
  () => songs[currentIndex.value - 1],
  (newVal) => {
    if (newVal?.src == null) return
    console.log(newVal?.src)
    src.value = newVal?.src
    useTitle(newVal?.name)
    audio.value?.addEventListener('loadstart', () => {
      playing.value = false
    })
    audio.value?.addEventListener('canplay', () => {
      playing.value = true
    })
  }
)
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
          <keep-alive>
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </router-view>
      </n-layout-content>
    </n-layout>
    <n-layout-footer
      bordered
      class="h-20 flex items-center bg-transparent px-2"
    >
      <div
        v-if="currentTime"
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
            v-if="currentIndex"
            width="64"
            height="64"
            :src="`${songs[currentIndex - 1]?.picUrl}?param=256y256`"
            class="flex mr-2"
          />
          <span class="flex mr-4">{{ songs[currentIndex - 1]?.name }}</span>
        </n-gi>
        <n-gi span="1" class="flex items-center justify-center">
          <audio ref="audio" />
          <span class="flex mr-2"></span>
          <base-button>
            <i-bi-skip-start-fill />
          </base-button>
          <base-button circle class="mx-8" @click="playing = !playing">
            <i-carbon-pause-filled v-if="playing" />
            <i-carbon-play-filled-alt v-else />
          </base-button>
          <base-button>
            <i-bi-skip-end-fill />
          </base-button>
        </n-gi>
        <n-gi span="2" class="flex items-center justify-end">
          <span v-if="currentTime" class="flex mr-2">
            {{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}
          </span>
          <base-button ref="trigger" @click="muted = !muted">
            <i-carbon-volume-mute v-if="muted" />
            <i-carbon-volume-up v-else />
          </base-button>
          <n-slider
            v-model:value="volume"
            ref="slider"
            :step="0.01"
            :max="1"
            :disabled="muted"
            :format-tooltip="(value: number) => {
              return value * 100
            }"
            class="w-40 mx-2"
          />
          <base-button>
            <i-ph-playlist />
          </base-button>
        </n-gi>
      </n-grid>
    </n-layout-footer>
  </n-layout>
</template>
