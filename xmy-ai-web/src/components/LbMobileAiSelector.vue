<script setup lang="ts">
import { ref } from 'vue'
import LbMoreAiModal from './LbMoreAiModal.vue'
import { switchAiPage } from '@/state/uiPlaygroundsCurrentPlaygroundPages'
import { postRnMessage } from '@/state/mobile'

const aiIndex = ref(-1)
const aiKey = ref('')
const moreAiVisible = ref(false)
function showAiSelector(index: number, key: string = '') {
  aiIndex.value = index
  aiKey.value = key
  moreAiVisible.value = true
}
Object.assign(window, { showAiSelector })

function onOk(key: string) {
  postRnMessage({
    type: 'SELECT_AI_DIALOG_CLOSE',
  })
  switchAiPage(aiIndex.value, key)
}
function onCancel() {
  postRnMessage({
    type: 'SELECT_AI_DIALOG_CLOSE',
  })
}
</script>
<template>
  <LbMoreAiModal v-model="moreAiVisible" :ai-key="aiKey" @ok="onOk" @cancel="onCancel" />
</template>
<style lang="css" scoped></style>
