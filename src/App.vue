<script setup lang="ts">
import { onMounted, provide, ref } from 'vue'
import { appWindow } from '@tauri-apps/api/window'
import type { GlobalThemeOverrides } from 'naive-ui'

onMounted(() => {
  appWindow.show()
  appWindow.setFocus()
})

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#f5222d',
    primaryColorHover: '#ff4d4f',
    primaryColorPressed: '#cf1322',
    primaryColorSuppl: '#ff4d4f',
  },
}

const theme = ref(null)
provide('theme', theme)
</script>
<template>
  <n-config-provider
    :theme-overrides="themeOverrides"
    :theme="theme"
    inline-theme-disabled
    onselectstart="return false"
    ondragstart="return false"
  >
    <app-router />
  </n-config-provider>
</template>
