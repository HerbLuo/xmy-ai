<script setup lang="ts">
import { alert, closeAlert } from '@/utils/alert'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <transition>
    <alert-background v-if="alert.visible">
      <alert-box :class="alert.type">
        <alert-content>
          <cp-svg-icon :name="`msg_${alert.type}`" :size="16" />
          {{ alert.message }}
        </alert-content>
        <alert-action-bar>
          <button @click="closeAlert">{{ t('ok') }}</button>
        </alert-action-bar>
      </alert-box>
    </alert-background>
  </transition>
</template>

<style scoped>
alert-background {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 999;
  background-color: #aaa6;
  backdrop-filter: blur(1px);
}

alert-box {
  background-color: #fff;
  width: 280px;
  box-shadow: var(--box-shadow);
  border-radius: 6px;
  padding: 12px;
}
.dark alert-box {
  background-color: #505050;
  color: #aaa;
}

alert-content {
  margin-top: 2px;
  margin-left: 2px;
  display: flex;
  align-items: center;
}
svg-ico {
  margin: 2px 6px 2px 2px;
}

.info svg-ico {
  color: #409eff;
}
.success svg-ico {
  color: #67c23a;
}
.error svg-ico {
  color: #f56c6c;
}
.warn svg-ico {
  color: #e6a23c;
}

alert-action-bar {
  height: 38px;
  padding-top: 10px;
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}
button {
  border: var(--normal-border);
  padding: 0 16px;
}
button:hover {
  color: #fff;
  background-color: #aaa;
}
.dark button {
  color: #aaa;
}
.dark button:hover,
.dark button:hover,
.dark button.actived {
  color: #555;
  background-color: #eee9;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
