<script setup lang="ts">
import { computed } from 'vue'

export type Value = string | number | null | boolean | undefined
export interface Option {
  label: string
  value: Value
  sup?: string
  tooltip?: string
}
const props = defineProps<{
  options: Option[]
  moreIcon?: boolean
  default?: string
  href?: string | null
}>()
const emit = defineEmits(['click'])
const value = defineModel<Value>('value')
const currentLabel = computed(() => {
  return props.options.find((it) => it.value === value.value)?.label || props.default || ' '
})
function onOptionClick(val: Value, label: string, i: number) {
  value.value = val
  emit('click', val, label, i)
}
</script>
<template>
  <opt-box class="macos-scrollbar">
    <opt-cur>
      <a v-if="href" :href="href" target="_blank">{{ currentLabel }}</a>
      <template v-else>{{ currentLabel }}</template>
      <slot name="icon"></slot>
      <cp-svg-icon v-if="moreIcon" name="more" :size="19" />
    </opt-cur>
    <ul>
      <template v-for="({ label, value: val, sup }, i) in options" :key="val + ''">
        <li :class="{ actived: val === value }" @click="onOptionClick(val, label, i)">
          {{ label }}<sup v-if="sup">{{ sup }}</sup>
        </li>
      </template>
    </ul>
  </opt-box>
</template>
<style lang="css" scoped>
opt-box {
  position: relative;
  cursor: pointer;
  overflow: visible;
  color: #555;
}
.dark opt-box {
  color: #eee;
}
opt-cur {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 98px;
  height: 32px;
  padding: 0 6px;
  transition: 0.3s border-color ease;
  border: 1px solid transparent;
}
opt-cur a {
  color: #eee;
}
opt-box:hover opt-cur {
  height: 32px;
  border: var(--actived-border);
}
ul {
  width: 98px;
  position: absolute;
  z-index: 10;
  padding: 0;
  top: 100%;
  right: 0;
  display: flex;
  overflow-y: scroll;
  width: 0;
  height: 0;
  opacity: 0;
  transition:
    0.3s width ease,
    0.3s height ease,
    0.3s opacity ease;
  background-color: #fff;
  flex-direction: column;
}
.dark ul {
  background-color: #3d3d3d;
}
opt-box:hover ul {
  opacity: 1;
  width: 98px;
  height: unset;
  max-height: 198px;
  box-shadow: var(--box-shadow);
}
.dark opt-box:hover ul {
  box-shadow: none;
}
opt-box:hover li:first-child {
  border-top: 0;
}
li {
  flex: 0 0 auto;
  border-left: var(--normal-border);
  border-top: var(--normal-border);
  border-right: var(--normal-border);
  width: 98px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.3s color ease;
}
li:last-child {
  border-bottom: var(--normal-border);
}
li:hover:not(.actived) {
  color: var(--actived-color);
  border-left: var(--actived-border);
  border-top: var(--actived-border);
  border-right: var(--actived-border);
  box-shadow: var(--box-shadow);
}
.dark li:hover {
  box-shadow: none;
}
li.actived {
  color: #999;
  cursor: not-allowed;
}
.dark li.actived {
  color: #7e7e7e;
}
li:last-child:hover:not(.actived) {
  border-bottom: var(--actived-border);
}

li:hover:not(.actived) + li {
  border-top: var(--actived-border);
}

li {
  position: relative;
}
li sup {
  font-size: 9px;
  position: absolute;
  top: -2px;
  right: 0;
}
</style>
