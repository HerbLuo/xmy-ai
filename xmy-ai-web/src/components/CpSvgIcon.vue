<script setup lang="ts">
import { computed } from 'vue'

const { size } = defineProps<{
  name: string
  size?: number | string
}>()

const style = computed(() => {
  const width = typeof size === 'number' ? `${size}px` : size
  const height = width
  return size ? { width, height } : undefined
})
</script>

<template>
  <svg-ico>
    <svg aria-hidden="true" v-bind="$attrs" :style="style" xmlns="http://www.w3.org/2000/svg">
      <use :xlink:href="`/__spritemap#sprite-${name}`" />
    </svg>
  </svg-ico>
</template>
<style lang="css" scoped>
svg-ico {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
</style>
