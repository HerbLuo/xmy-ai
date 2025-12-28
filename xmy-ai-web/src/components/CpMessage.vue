<script lang="ts" setup>
import { messages } from '@/utils/message'
</script>

<template>
  <message-tips>
    <TransitionGroup>
      <message-tip v-for="msg in messages" :key="msg" :class="msg.type">
        <cp-svg-icon :name="`msg_${msg.type}`" :size="13" />
        {{ msg.message }}
      </message-tip>
    </TransitionGroup>
  </message-tips>
</template>

<style scoped>
message-tips {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 20px;
  left: 0;
  right: 0;
  z-index: 999;
  pointer-events: none;
}
message-tip {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #fff;
  margin: 6px;
  padding: 2px 12px 2px 6px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: all;
}
.dark message-tip {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
svg-ico {
  margin: 6px 4px;
}
.info {
  background-color: #409eff;
}
.success {
  background-color: #67c23a;
}
.error {
  background-color: #f56c6c;
}
.warn {
  background-color: #e6a23c;
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
