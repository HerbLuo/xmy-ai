<script setup lang="ts">
import { ini_ui_header } from '@/state/uiHeader'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  title: string
  transformOrigin?: 'center' | 'topright'
  onOk?: null | undefined | (() => void)
  onCancel?: null | undefined | (() => void)
  okText?: string
  cancelText?: string
}>()
const hidden = ref(true)
const visible = ref(false)
const show = defineModel<boolean>('show')
const emit = defineEmits(['close'])

const { t } = useI18n()

watch(show, () => {
  if (show.value) {
    hidden.value = true
    setTimeout(() => {
      hidden.value = false
    })
    visible.value = true
  } else {
    hidden.value = false
    setTimeout(() => {
      hidden.value = true
    })
    setTimeout(() => {
      visible.value = false
    }, 201)
  }
})

function close() {
  show.value = false
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>
<template>
  <Teleport defer to="#modal-wrapper">
    <modal-backdrop v-if="visible" :class="{ hidden }"> </modal-backdrop>
    <modal-background
      v-if="visible"
      @mousedown="close"
      :class="{
        hidden,
        left: ini_ui_header.position === 'left',
        topright: transformOrigin === 'topright',
      }"
    >
      <!-- <input v-if="!mobileMode" style="opacity: 0" ref="input" @keyup.escape="close" /> -->
      <modal-content @mousedown.stop :class="{ 'with-action-bar': onOk || onCancel }">
        <modal-title>
          {{ title }}
          <button @click="close">
            <cp-svg-icon name="close" :size="26" />
          </button>
        </modal-title>
        <slot></slot>
        <modal-action-bar v-if="onOk || onCancel">
          <button v-if="onCancel" @click="onCancel">{{ cancelText || t('cancel') }}</button>
          <button v-if="onOk" @click="onOk">{{ okText || t('ok') }}</button>
        </modal-action-bar>
      </modal-content>
    </modal-background>
  </Teleport>
</template>
<style lang="css" scoped>
modal-backdrop {
  transition: opacity 0.2s ease;
  position: fixed;
  background-color: #9996;
  backdrop-filter: blur(6px);
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
modal-backdrop.hidden {
  opacity: 0;
}
modal-background {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  transform-origin: center;
  transform: scale(1);
}
.topright {
  transform-origin: top right;
}
modal-background.left {
  transform-origin: left bottom;
}
modal-background.hidden {
  opacity: 0;
  transform: scale(0);
}
modal-content {
  min-width: 380px;
  min-height: 280px;
  max-height: 632px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: var(--box-shadow);
  overflow: hidden;
}
modal-content.with-action-bar {
  max-height: 678px;
}
modal-action-bar {
  height: 50px;
  padding: 0px 22px 18px 10px;
  display: flex;
  justify-content: flex-end;
}
modal-action-bar button {
  margin-left: 8px;
  border: var(--normal-border);
  padding: 0 16px;
}
modal-action-bar button:hover {
  color: #fff;
  background-color: #aaa;
}
.dark modal-content {
  background-color: #3d3d3d;
  color: #aaa;
}
modal-title {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  border-bottom: 1px solid #aaa;
}
modal-title button {
  color: #555;
  cursor: pointer;
  background-color: #eee0;
  padding: 0;
}
.dark button {
  color: #aaa;
}
modal-title button:hover,
modal-title button.actived {
  color: #1890ff;
  background-color: #eee9;
}

.dark button:hover,
.dark button:hover,
.dark button.actived {
  color: #555;
  background-color: #eee9;
}
@media (max-width: 450px) {
  modal-content {
    min-width: unset;
    min-height: unset;
    width: 100%;
    height: 100%;
  }
}
</style>
