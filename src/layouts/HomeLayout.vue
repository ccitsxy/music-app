<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { useMediaControls } from '@vueuse/core'
import { computed, ref } from 'vue'

const menuOptions: MenuOption[] = [
  {
    label: '发现音乐',
    key: '/discover',
  },
  // {
  //   label: '播客',
  //   key: '/podcast',
  // },
  // {
  //   label: '视频',
  //   key: '/video',
  // },
  // {
  //   label: '关注',
  //   key: 'follow',
  // },
  // {
  //   label: '直播',
  //   key: 'live',
  // },
  // {
  //   label: '私人FM',
  //   key: 'FM',
  // },
  // {
  //   type: 'group',
  //   label: '我的音乐',
  //   key: 'my music',
  //   children: [],
  // },
  // {
  //   label: '本地与下载',
  //   key: 'local&download',
  // },
  // {
  //   label: '最近播放',
  //   key: 'recent play',
  // },
  // {
  //   label: '我的音乐云盘',
  //   key: 'my music cloud',
  // },
  // {
  //   label: '我的播客',
  //   key: 'my procast',
  // },
  // {
  //   label: '我的收藏',
  //   key: 'my collection',
  // },
  // {
  //   type: 'group',
  //   label: '创建的歌单',
  //   key: 'my music',
  //   children: [],
  // },
  // {
  //   label: '我喜欢的音乐',
  //   key: 'my favorite music',
  // },
]
const router = useRouter()
function updateValue(key: string) {
  router.push(key)
}

const music = ref('Sad Sometimes (feat. 黄霄云).mp3')
const audio = ref<HTMLMediaElement>()
const { playing, currentTime, duration, volume, buffered, muted } =
  useMediaControls(audio, {
    src: music,
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
      <n-layout-content
        ref="layoutContent"
        class="!h-[calc(100vh-9rem)]]"
        content-style="padding: 24px;"
      >
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
      <n-grid class="h-full" :cols="3">
        <n-gi class="flex items-center"> <img src="@/assets/logo.svg" /> </n-gi>
        <n-gi class="flex flex-col items-center justify-center">
          <div class="flex items-center">
            <audio ref="audio" />
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
          </div>
          <div class="flex items-center">
            <span class="flex">{{ formatDuration(currentTime) }}</span>
            <slide-scrubber
              v-model="currentTime"
              :max="duration"
              :secondary="endBuffer"
              class="flex w-96 mx-2"
            />
            <span class="flex"> {{ formatDuration(duration) }} </span>
          </div>
        </n-gi>
        <n-gi class="flex items-center justify-end">
          <base-button @click="muted = !muted">
            <i-carbon-volume-mute v-if="muted" />
            <i-carbon-volume-up v-else />
          </base-button>
          <n-slider
            v-model:value="volume"
            :step="0.01"
            :max="1"
            :format-tooltip="
              (value) => {
                return Math.floor(value * 100)
              }
            "
            class="w-40 mx-2"
            :disabled="muted"
          />
          <base-button>
            <i-ph-playlist />
          </base-button>
        </n-gi>
      </n-grid>
    </n-layout-footer>
  </n-layout>
</template>
