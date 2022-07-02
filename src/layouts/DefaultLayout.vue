<script setup lang="ts">
import { appWindow } from '@tauri-apps/api/window'
import { useThemeVars, darkTheme } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'
import { computed, inject, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'

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
const colorScheme = computed(() => (theme?.value ? 'dark' : 'light'))
</script>
<template>
  <n-layout>
    <n-layout-header
      data-tauri-drag-region
      class="h-16 flex items-center bg-$n-color px-2"
      bordered
    >
      <n-button quaternary :disabled="disableBack" @click="$router.go(-1)">
        <i-carbon-chevron-left />
      </n-button>
      <n-button quaternary :disabled="disableForward" @click="$router.go(1)">
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
      <router-view />
    </n-layout-content>
  </n-layout>
</template>

<style>
body {
  overflow: hidden;
}

:root {
  color-scheme: v-bind('colorScheme');
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
