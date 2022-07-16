<script setup lang="ts">
import { appWindow } from '@tauri-apps/api/window'
import { inject, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'

import { useThemeVars, darkTheme } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'
import { useFetch } from '@/composables/useFetch'
import { fixedEncodeURI } from '@/utils/fixedEncodeURI'

const isMaximized = ref(false)
appWindow.isMaximized().then((e) => {
  isMaximized.value = e
})
appWindow.onResized(() => {
  appWindow.isMaximized().then((e) => {
    isMaximized.value = e
  })
})

const theme = inject<Ref<GlobalTheme | null | undefined>>('theme')
const themeVars = useThemeVars()

const disableBack = ref(true)
const disableForward = ref(true)
const router = useRouter()
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
const searchText = ref('')
function search() {
  router.push(`/search/${fixedEncodeURI(searchText.value)}`)
}

const showLoginModal = ref(false)
const qrimgSrc = ref('')
function openloginModal() {
  showLoginModal.value = true
  loginByQrcode()
}
async function loginByQrcode() {
  useFetch(`/login/qr/key?timerstamp=${Date.now()}`)
    .json()
    .then((result) => {
      const key = result.data.value.data.unikey
      useFetch(
        `/login/qr/create?key=${key}
        &timerstamp=${Date.now()}
        &qrimg=true`
      )
        .json()
        .then((result) => {
          qrimgSrc.value = result.data.value.data.qrimg
          useFetch(`/login/qr/check?key=${key}`)
        })
    })
}
</script>
<template>
  <n-layout>
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

    <n-layout-content>
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
            <div class="px-14px">扫码登录</div>
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
      <router-view />
    </n-layout-content>
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
  width: 8px;
  height: 8px;
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
