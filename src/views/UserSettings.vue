<script setup lang="ts">
const env = import.meta.env
</script>
<template>
  <div>
    <pre class="whitespace-pre-wrap font-mono">{{ env.TAURI_CONFIG }}</pre>
  </div>
</template>
