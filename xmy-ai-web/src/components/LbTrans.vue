<script setup lang="ts">
import { appendLbTransFlag } from '@/action/translate'
import { translate_setting } from '@/state/translateEngine'
import { ini_ui, toggleTranslator } from '@/state/ui'
import { currentQuestionOptions } from '@/state/uiPlaygroundsCurrentQuestionOptions'
import { EVENT_Iframe_Evaler_Preapred, eventBus } from '@/utils/EventBus'

eventBus.on(EVENT_Iframe_Evaler_Preapred, () => {
  const frame = document.querySelector<HTMLIFrameElement>('#trans_engine')
  if (frame) {
    appendLbTransFlag(frame)
  }
})
</script>

<template>
  <translator-box :class="{ v: ini_ui.translatorVisibility === 'visible' }">
    <button @click="toggleTranslator">
      <cp-svg-icon name="close" :size="26" />
    </button>
    <iframe
      id="trans_engine"
      v-if="currentQuestionOptions?.translate"
      :src="`${translate_setting.url}?trans=true`"
    />
  </translator-box>
</template>

<style lang="css" scoped>
translator-box {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}
translator-box.v {
  z-index: 11;
}
button {
  position: absolute;
  right: calc(10% + 6px);
  top: calc(10% + 6px);
  background-color: gray;
  color: white;
  box-shadow: var(--box-shadow);
  pointer-events: auto;
}
iframe {
  width: 80%;
  height: 80%;
  min-width: 1333px;
  min-height: 380px;
  pointer-events: auto;
}
</style>
