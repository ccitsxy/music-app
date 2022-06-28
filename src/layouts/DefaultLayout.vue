<script setup lang="ts">
import { appWindow } from '@tauri-apps/api/window'
import { useThemeVars, darkTheme } from 'naive-ui'
import { inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'

const theme = inject('theme')
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
</script>
<template>
  <n-layout class="h-full">
    <n-layout-header
      data-tauri-drag-region
      class="h-16 flex items-center bg-$n-color px-2"
      bordered
    >
      <base-button :disabled="disableBack" @click="$router.go(-1)">
        <i-carbon-chevron-left />
      </base-button>
      <base-button :disabled="disableForward" @click="$router.go(1)">
        <i-carbon-chevron-right />
      </base-button>
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
      <base-button v-if="theme" @click="theme = null">
        <i-carbon-moon />
      </base-button>
      <base-button v-else @click="theme = darkTheme">
        <i-carbon-sun />
      </base-button>
      <base-button @click="appWindow.minimize()">
        <i-codicon-chrome-minimize />
      </base-button>
      <base-button @click="appWindow.toggleMaximize()">
        <i-codicon-chrome-maximize />
        <!-- <i-codicon-chrome-restore /> -->
      </base-button>
      <base-button @click="appWindow.close()">
        <i-codicon-chrome-close />
      </base-button>
    </n-layout-header>

    <n-layout-content class="h-[calc(100vh-4rem)]">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>

<style>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: v-bind('themeVars.scrollbarColor');
}
.n-layout .n-layout-scroll-container {
  overflow-y: overlay;
}
</style>
