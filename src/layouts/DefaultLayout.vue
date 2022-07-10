<script setup lang="ts">
import { appWindow } from '@tauri-apps/api/window'
import { useThemeVars, darkTheme } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'
import { inject, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFetch } from '@/composables/useFetch'

const theme = inject<Ref<GlobalTheme | null | undefined>>('theme')
const searchText = ref('')
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
const themeVars = useThemeVars()
const showLoginModal = ref(false)
const qrimgSrc = ref('')
function openloginModal() {
  showLoginModal.value = true
  loginByQrcode()
}
function loginByQrcode() {
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
        :disabled="disableBack"
        @click="$router.go(-1)"
      >
        <i-carbon-chevron-left />
      </n-button>
      <n-button
        quaternary
        :focusable="false"
        :disabled="disableForward"
        @click="$router.go(1)"
      >
        <i-carbon-chevron-right />
      </n-button>
      <n-input
        v-model:value="searchText"
        placeholder="搜索"
        class="mx-4 !w-60"
        @keyup.enter="$router.push(`/search/${searchText}`)"
      >
        <template #prefix>
          <i-carbon-search />
        </template>
      </n-input>
      <div class="flex-1" />
      <n-button quaternary :focusable="false" @click="openloginModal">
        <i-carbon-user />
      </n-button>
      <n-button quaternary :focusable="false">
        <i-carbon-settings @click="$router.push('/settings')" />
      </n-button>
      <n-button
        v-if="theme"
        quaternary
        :focusable="false"
        @click="theme = null"
      >
        <i-carbon-moon />
      </n-button>
      <n-button v-else quaternary :focusable="false" @click="theme = darkTheme">
        <i-carbon-sun />
      </n-button>
      <n-button quaternary :focusable="false" @click="appWindow.minimize()">
        <i-codicon-chrome-minimize />
      </n-button>
      <n-button
        quaternary
        :focusable="false"
        @click="appWindow.toggleMaximize()"
      >
        <i-codicon-chrome-maximize />
        <!-- <i-codicon-chrome-restore /> -->
      </n-button>
      <n-button quaternary :focusable="false" @click="appWindow.close()">
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
          style="width: 480px"
          :bordered="false"
          size="huge"
          role="dialog"
          aria-modal="true"
        >
          <template #header-extra>
            <n-button quaternary focusable @click="showLoginModal = false">
              <i-codicon-chrome-close />
            </n-button>
          </template>
          <template #header>扫码登录</template>
          <img
            :src="qrimgSrc"
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
</style>
