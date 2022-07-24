<script setup lang="ts">
import { shallowRef } from 'vue'

import { api } from '@/utils/api'

const data = shallowRef()
api.get('/user/account').then((res) => {
  data.value = res.data
})
</script>
<template>
  <div>
    <n-button :focusable="false" :native-focus-behavior="false">
      button
    </n-button>
    <pre>
      {{ data }}
    </pre>
  </div>
</template>
