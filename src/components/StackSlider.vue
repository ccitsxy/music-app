<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEventListener, useMouseInElement, useVModel } from '@vueuse/core'

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  secondary: { type: Number, default: 0 },
  modelValue: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue'])

const scrubber = ref()
const scrubbing = ref(false)
const pendingValue = ref(0)

useEventListener('mouseup', () => (scrubbing.value = false))

const value = useVModel(props, 'modelValue', emit)
const { elementX, elementWidth } = useMouseInElement(scrubber)

watch([scrubbing, elementX], () => {
  const progress = Math.max(0, Math.min(1, elementX.value / elementWidth.value))
  pendingValue.value = progress * props.max
  if (scrubbing.value) value.value = pendingValue.value
})
</script>

<template>
  <n-el
    ref="scrubber"
    class="relative h-1 py-7px cursor-pointer select-none"
    @mousedown="scrubbing = true"
  >
    <div
      class="relative overflow-hidden h-full w-full bg-$border-color bg-opacity-20"
    >
      <div
        class="h-full absolute top-0 left-0 bg-$primary-color"
        :style="{ width: `${(value / max) * 100}%` }"
      />
      <div
        class="h-full absolute opacity-30 top-0 left-0 bg-$primary-color-hover"
        :style="{ width: `${(secondary / max) * 100}%` }"
      />
    </div>
    <div class="h-full absolute left-8px right-8px bottom-0 top-0">
      <div
        class="z-0 outline-none absolute top-1/2 cursor-pointer flex"
        style="transform: translate(-50%, -50%)"
        :style="{ left: `${(value / max) * 100}%` }"
      >
        <div class="h-4 w-4 rounded-1/2 bg-white stack-slider-shadow" />
      </div>
    </div>
  </n-el>
</template>

<style scoped>
.stack-slider-shadow {
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3),
    inset 0 0 1px 0 rgba(0, 0, 0, 0.05);
}
</style>
