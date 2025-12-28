<script setup lang="ts">
import { ref, watch } from 'vue'
import CpModal from './CpModal.vue'
import { changeAiPrefix, currentPlayground } from '@/state/uiPlaygroundsCurrentPlayground'
import { useAio } from '@/state/aios'
import { useI18n } from 'vue-i18n'
const props = defineProps<{
  aiKey: string
  aiName: string
}>()
const show = defineModel<boolean>()
const prefix = ref<string>()
watch(show, () => {
  prefix.value = currentPlayground.value?.prefixs[props.aiKey]
})

const { t } = useI18n()

const url = ref<string>()
watch(
  () => props.aiKey,
  () => {
    useAio(props.aiKey, (aio) => {
      url.value = aio?.url
    })
  },
)

function onPrefixBlur() {
  changeAiPrefix(props.aiKey, prefix.value || '')
}
</script>

<template>
  <CpModal v-model:show="show" :title="`${aiName}${t('settingText')}`">
    <setting-content>
      <setting-group>
        <setting-group-name>
          <a :href="url" target="_blank">{{ t('ai-setting.new-tab', { aiName }) }}</a>
        </setting-group-name>
      </setting-group>
      <setting-group>
        <setting-group-name>{{ t('ai-setting.prompt-prefix') }}</setting-group-name>
        <textarea
          rows="3"
          v-model="prefix"
          :placeholder="t('ai-setting.prompt-prefix-placeholder', { aiName })"
          @blur="onPrefixBlur"
        />
      </setting-group>
    </setting-content>
  </CpModal>
</template>

<style lang="css" scoped>
setting-content {
  display: flex;
  flex-direction: column;
  padding: 16px;
  width: 380px;
  height: 80vh;
  max-height: 520px;
}
setting-group {
  display: flex;
  flex-direction: column;
}
setting-group-name {
  padding: 16px 0px;
}
a {
  color: #666;
}
.dark a {
  color: #aaa;
}
textarea {
  resize: none;
  outline: none;
  background-color: #0001;
  border-radius: 6px;
  padding: 8px 12px;
  max-width: 100%;
}
.dark textarea {
  color: #aaa;
  caret-color: #aaa;
}
button {
  color: inherit;
  font-size: 16px;
  padding: 4px 16px;
  background-color: #0001;
  border: var(--normal-border);
}
@media (max-width: 450px) {
  setting-content {
    width: 100%;
    max-height: 100%;
  }
}
</style>
