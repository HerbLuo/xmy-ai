<script setup lang="ts">
import { translate_setting } from '@/state/translateEngine'
import { currentQuestionOptions } from '@/state/uiPlaygroundsCurrentQuestionOptions'
</script>

<template>
  <iframe
    id="trans_engine"
    v-if="currentQuestionOptions?.translate"
    :src="`${translate_setting.url}?trans=true`"
  />
</template>

<style lang="css" scoped>
iframe {
  position: fixed;
  top: 51px;
  width: 1333px;
  height: 380px;
  z-index: 1;
}
</style>
