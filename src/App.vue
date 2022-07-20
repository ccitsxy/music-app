<script setup lang="ts">
import { onMounted, provide, shallowRef, watch } from 'vue'
import { appWindow } from '@tauri-apps/api/window'
import { darkTheme, useOsTheme } from 'naive-ui'
import type { GlobalThemeOverrides, GlobalTheme } from 'naive-ui'

onMounted(() => {
  window.onselectstart = () => {
    return false
  }
  window.ondragstart = () => {
    return false
  }
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
const osTheme = useOsTheme()
const theme = shallowRef<GlobalTheme | null>(null)
watch(
  () => osTheme.value,
  (newVal) => {
    theme.value = newVal === 'dark' ? darkTheme : null
  },
  { immediate: true }
)
provide('theme', theme)
</script>
<template>
  <n-config-provider
    :theme-overrides="themeOverrides"
    :theme="theme"
    inline-theme-disabled
  >
    <app-router />
  </n-config-provider>
</template>
