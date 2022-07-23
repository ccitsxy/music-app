<script setup lang="ts">
import { provide, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import { useThemeVars } from 'naive-ui'
import type { MenuOption } from 'naive-ui'

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
const layoutContent = shallowRef<HTMLElement>()
provide('layoutContent', layoutContent)

const themeVars = useThemeVars()
</script>

<template>
  <n-layout class="h-screen">
    <n-layout-header
      data-tauri-drag-region
      class="bg-$n-color flex h-16 items-center px-2"
      bordered
    >
      <layout-header />
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
        <router-view v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath" />
        </router-view>
      </n-layout-content>
    </n-layout>
    <n-layout-footer
      bordered
      class="flex h-20 items-center bg-transparent px-2"
    >
      <layout-footer />
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
