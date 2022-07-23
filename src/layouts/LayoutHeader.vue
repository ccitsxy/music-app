<script setup lang="ts">
import { inject, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'
import { useRouter } from 'vue-router'

import { fixedEncodeURI } from '@/utils/fixedEncodeURI'
import { appWindow } from '@tauri-apps/api/window'
import { darkTheme, useMessage } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'
import { api } from '@/utils/api'
import { useTimeoutPoll } from '@vueuse/core'

const theme = inject<ShallowRef<GlobalTheme | null | undefined>>('theme')
const router = useRouter()
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
const unikey = shallowRef('')
const qrimgSrc = shallowRef('')
const message = useMessage()
async function qrcodeCheck() {
  const res = await api.get(
    `/login/qr/check?key=${unikey.value}&timerstamp=${Date.now()}`
  )
  if (res.data.code === 800) {
    message.error('二维码已过期,请重新获取')
  }
  if (res.data.code === 803) {
    localStorage.setItem('cookie', res.data.cookie)
    message.success('二维码登录成功')
    pause()
  }
}
const { pause, resume } = useTimeoutPoll(qrcodeCheck, 3000)
function openloginModal() {
  showLoginModal.value = true
  loginByQrcode()
}
function closeLoginModel() {
  showLoginModal.value = false
  pause()
}
function loginByQrcode() {
  api.get(`/login/qr/key?timerstamp=${Date.now()}`).then((res) => {
    unikey.value = res.data.data.unikey
    api
      .get(
        `/login/qr/create?key=${
          unikey.value
        }&qrimg=true&timerstamp=${Date.now()}`
      )
      .then((res) => {
        qrimgSrc.value = res.data.data.qrimg
        resume()
      })
  })
}
const isMaximized = shallowRef(false)
appWindow.isMaximized().then((e) => {
  isMaximized.value = e
})
appWindow.onResized(() => {
  appWindow.isMaximized().then((e) => {
    isMaximized.value = e
  })
})
</script>

<template>
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
    @click="openloginModal()"
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
  <n-modal
    v-model:show="showLoginModal"
    :auto-focus="false"
    :mask-closable="false"
  >
    <n-card
      class="w-[480px]"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      header-style="padding: 8px"
      content-style="padding-top: 28px;"
    >
      <template #header>
        <div class="text-base pl-[14px]">扫码登录</div>
      </template>
      <template #header-extra>
        <n-button
          quaternary
          :focusable="false"
          :native-focus-behavior="false"
          @click="closeLoginModel()"
        >
          <i-codicon-chrome-close />
        </n-button>
      </template>
      <div class="flex items-center">
        <img
          width="126"
          height="221"
          src="https://p5.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9643571155/525c/faac/2dc6/fe695c03c7c358ddaa4651736b26a55f.png"
        />
        <div v-if="qrimgSrc" class="ml-20 flex h-48 w-48">
          <use-image :src="qrimgSrc">
            <template #loading>
              <n-skeleton class="flex h-48 w-48" />
            </template>
          </use-image>
        </div>
        <n-skeleton v-else class="ml-20 flex h-48 w-48" />
      </div>
    </n-card>
  </n-modal>
</template>
