<script setup lang="ts">
defineProps({
  circle: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <n-el
    class="flex items-center justify-center text-$text-color-base border-none rounded outline-none"
    :class="[
      circle
        ? 'rounded-full p-3 bg-$hover-color hover:bg-$button-color-2-hover'
        : 'rounded px-4 py-2 bg-transparent hover:bg-$hover-color',
      disabled
        ? 'cursor-not-allowed opacity-50 hover:bg-transparent'
        : 'cursor-pointer',
    ]"
  >
    <slot />
  </n-el>
</template>
