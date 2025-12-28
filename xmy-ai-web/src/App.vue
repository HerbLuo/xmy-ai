<script setup lang="ts">
import LbHead from './components/LbHead.vue'
import LbMain from './components/LbMain.vue'
import LbQuesBar from './components/LbQuesBar.vue'
import LbTrans from './components/LbTrans.vue'
import { theme } from './state/ui'
import CpMessage from './components/CpMessage.vue'
import CpAlert from './components/CpAlert.vue'
import { mobileMode } from './state/env'
import { initMobile } from './state/mobile'
import LbMobileAiSelector from './components/LbMobileAiSelector.vue'
import { ini_ui_language } from './state/i18n'

if (mobileMode.value) {
  initMobile()
}
</script>
<template>
  <lb-theme :class="theme">
    <LbHead />
    <lb-content :class="{ mm: mobileMode }">
      <LbMain v-if="!mobileMode" />
      <LbQuesBar v-if="!mobileMode" />
    </lb-content>
    <LbMobileAiSelector v-if="mobileMode" />
    <modal-wrapper id="modal-wrapper"></modal-wrapper>
    <CpMessage />
    <CpAlert />
    <bei-an v-if="!mobileMode && ini_ui_language === 'zh-CN'">浙ICP备15038202号-3</bei-an>
  </lb-theme>
  <LbTrans v-if="!mobileMode" />
</template>
<style lang="css" scoped>
lb-theme {
  position: fixed;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  z-index: 10;
}
lb-theme:has(header.top) {
  flex-direction: column;
}
lb-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background-color: #edf1fa;
  padding: 12px;
}
.dark lb-content {
  background-color: #000;
}
lb-content.mm {
  background-color: transparent;
  pointer-events: none;
}
bei-an {
  color: #888;
  font-size: 12px;
  font-size: 11px;
  margin-bottom: -2px;
  position: fixed;
  left: 0;
  right: 0;
  text-align: center;
  bottom: 0;
}
.dark bei-an {
  color: #aaa;
}
</style>
