<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useEventListener, useMouseInElement, useVModel } from '@vueuse/core'

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  secondary: { type: Number, default: 0 },
  modelValue: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue'])

const scrubber = shallowRef()
const scrubbing = shallowRef(false)
const pendingValue = shallowRef(0)

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
    class="relative h-1 cursor-pointer select-none py-[7px]"
    @mousedown="scrubbing = true"
  >
    <div
      class="relative h-full w-full overflow-hidden bg-[color:var(--border-color)] bg-opacity-20"
    >
      <div
        class="absolute top-0 left-0 h-full bg-[color:var(--primary-color)]"
        :style="{ width: `${(value / max) * 100}%` }"
      />
      <div
        class="absolute top-0 left-0 h-full bg-[color:var(--primary-color-hover)] opacity-30"
        :style="{ width: `${(secondary / max) * 100}%` }"
      />
    </div>
    <div class="absolute left-2 right-2 bottom-0 top-0 h-full">
      <div
        class="absolute top-1/2 z-0 flex cursor-pointer outline-none"
        style="transform: translate(-50%, -50%)"
        :style="{ left: `${(value / max) * 100}%` }"
      >
        <div class="stack-slider-shadow h-4 w-4 rounded-full bg-white" />
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
