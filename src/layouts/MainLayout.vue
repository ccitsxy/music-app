<script setup lang="ts">
import { computed, inject, provide, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'
import { useRouter } from 'vue-router'

import { useSongStore } from '@/stores/song'

import { useThemeVars, darkTheme } from 'naive-ui'
import type { MenuOption, GlobalTheme } from 'naive-ui'
import { useEventListener, useMediaControls, useTitle } from '@vueuse/core'
import { fixedEncodeURI } from '@/utils/fixedEncodeURI'
import { appWindow } from '@tauri-apps/api/window'

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
const layoutContent = shallowRef<HTMLElement>()
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
const showSongList = shallowRef(false)
const isMaximized = shallowRef(false)
appWindow.isMaximized().then((e) => {
  isMaximized.value = e
})
appWindow.onResized(() => {
  appWindow.isMaximized().then((e) => {
    isMaximized.value = e
  })
})

const theme = inject<ShallowRef<GlobalTheme | null | undefined>>('theme')
const themeVars = useThemeVars()

const disableBack = shallowRef(true)
const disableForward = shallowRef(true)
watch(
  () => router.currentRoute.value.path,
  () => {
    disableBack.value = window.history.state.back == null
    disableForward.value = window.history.state.forward == null
  },
  {
    immediate: true,
  }
)
const searchText = shallowRef('')
function search() {
  router.push(`/search/${fixedEncodeURI(searchText.value)}`)
}

const showLoginModal = shallowRef(false)
const qrimgSrc = shallowRef('')
function openloginModal() {
  showLoginModal.value = true
  loginByQrcode()
}
function loginByQrcode() {
  //todo
}
</script>

<template>
  <n-layout class="h-screen">
    <n-layout-header
      data-tauri-drag-region
      class="h-16 flex items-center bg-$n-color px-2"
      bordered
    >
      <n-button
        quaternary
        :focusable="false"
        :native-focus-behavior="false"
        :disabled="disableBack"
        @click="$router.go(-1)"
      >
        <i-carbon-chevron-left />
      </n-button>
      <n-button
        quaternary
        :focusable="false"
        :native-focus-behavior="false"
        :disabled="disableForward"
        @click="$router.go(1)"
      >
        <i-carbon-chevron-right />
      </n-button>
      <n-input
        v-model:value="searchText"
        placeholder="搜索"
        class="mx-4 !w-60"
        @keyup.enter="search()"
      >
        <template #prefix>
          <i-carbon-search />
        </template>
      </n-input>
      <div class="flex-1" />
      <n-button
        quaternary
        :focusable="false"
        :native-focus-behavior="false"
        @click="openloginModal"
      >
        <i-carbon-user />
      </n-button>
      <n-button quaternary :focusable="false" :native-focus-behavior="false">
        <i-carbon-settings @click="$router.push('/settings')" />
      </n-button>
      <n-button
        v-if="theme"
        quaternary
        :focusable="false"
        :native-focus-behavior="false"
        @click="theme = null"
      >
        <i-carbon-moon />
      </n-button>
      <n-button
        v-else
        quaternary
        :focusable="false"
        :native-focus-behavior="false"
        @click="theme = darkTheme"
      >
        <i-carbon-sun />
      </n-button>
      <n-button
        quaternary
        :focusable="false"
        :native-focus-behavior="false"
        @click="appWindow.minimize()"
      >
        <i-codicon-chrome-minimize />
      </n-button>
      <n-button
        quaternary
        :focusable="false"
        :native-focus-behavior="false"
        @click="appWindow.toggleMaximize()"
      >
        <i-codicon-chrome-restore v-if="isMaximized" />
        <i-codicon-chrome-maximize v-else />
      </n-button>
      <n-button
        quaternary
        :focusable="false"
        :native-focus-behavior="false"
        @click="appWindow.close()"
      >
        <i-codicon-chrome-close />
      </n-button>
    </n-layout-header>
    <n-layout class="h-[calc(100vh-9rem)]" has-sider>
      <n-layout-sider width="12.5rem" bordered>
        <n-menu
          :value="$route.path"
          :options="menuOptions"
          @update-value="updateValue"
        />
      </n-layout-sider>
      <n-layout-content ref="layoutContent" content-style="padding: 1.5rem">
        <n-modal
          v-model:show="showLoginModal"
          :auto-focus="false"
          :mask-closable="false"
        >
          <n-card
            class="w-96"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
          >
            <template #header-extra>
              <n-button
                quaternary
                :focusable="false"
                :native-focus-behavior="false"
                @click="showLoginModal = false"
              >
                <i-codicon-chrome-close />
              </n-button>
            </template>
            <template #header>
              <div class="px-[14px]">扫码登录</div>
            </template>
            <div
              v-if="qrimgSrc"
              class="h-48 w-48 my-8 mx-auto flex justify-center"
            >
              <use-image :src="qrimgSrc">
                <template #loading>
                  <n-skeleton class="w-48 h-48 flex" />
                </template>
              </use-image>
            </div>
            <n-skeleton
              v-else
              class="h-48 w-48 my-8 mx-auto flex justify-center"
            />
          </n-card>
        </n-modal>
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
        class="flex items-center absolute left-0 bottom-[68px] w-screen z-10"
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
            class="flex mr-2"
          />
          <div>
            <n-ellipsis class="flex items-center flex-row mr-4 w-[25vw]">
              <span class="font-bold">
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
          <span v-if="currentIndex" class="flex mr-2">
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
            class="w-32 mx-2"
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
    </n-layout-footer>
  </n-layout>
</template>

<style>
body {
  overflow: hidden;
}

.n-layout .n-layout-scroll-container {
  overflow-y: overlay;
}

.n-layout .n-layout-scroll-container ::-webkit-scrollbar {
  width: 0.5rem;
  height: 0.5rem;
  background-color: transparent;
}

.n-layout .n-layout-scroll-container ::-webkit-scrollbar-thumb {
  background-color: v-bind('themeVars.scrollbarColor');
}

.n-layout .n-layout-scroll-container ::-webkit-scrollbar-thumb:hover {
  background-color: v-bind('themeVars.scrollbarColorHover');
}

.n-popover__content {
  cursor: default;
}

.n-data-table .n-data-table__pagination {
  justify-content: center;
}
</style>
