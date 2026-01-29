<script setup lang="ts">
import { ini_ui, switchLayout, switchTheme, toggleTranslator } from '@/state/ui'
import CpModal from './CpModal.vue'
import CpOptions, { type Option } from './CpOptions.vue'
import { ini_ui_header, switchHeaderPosition, switchHeaderSize } from '@/state/uiHeader'
import { computed, ref, watch } from 'vue'
import { aios } from '@/state/aios'
import { switchTranslateEngine, translate_setting } from '@/state/translateEngine'
import { logs } from '@/state/log'
import { postRnMessage } from '@/state/mobile'
import { mobileMode } from '@/state/env'
import { isCn, ini_ui_language, LanguageMap, switchLanguage } from '@/state/i18n'
import { useI18n } from 'vue-i18n'

const show = defineModel<boolean>()

const { t } = useI18n()

const themeOptions = computed<Option[]>(() => [
  {
    label: t('setting.system'),
    value: 'auto',
  },
  {
    label: t('setting.dark'),
    value: 'dark',
  },
  {
    label: t('setting.light'),
    value: 'light',
  },
])
const layoutOptions = computed<Option[]>(() => [
  {
    label: t('no'),
    value: 'large_screen',
  },
  {
    label: t('yes'),
    value: 'small_screen',
  },
])
const headerPositionOptions = computed<Option[]>(() => [
  {
    label: t('setting.top'),
    value: 'top',
  },
  {
    label: t('setting.left'),
    value: 'left',
  },
])
const headerSizeOptions = computed<Option[]>(() => [
  {
    label: t('setting.big'),
    value: 'big',
  },
  {
    label: t('setting.middle'),
    value: 'middle',
  },
  {
    label: t('setting.small'),
    value: 'small',
  },
])
const languareOptions: Option[] = Object.entries(LanguageMap).map(([label, value]) => {
  return {
    label,
    value,
  }
})
const transOptions = ref<Option[]>([])
watch(
  [() => Object.values(aios).filter((it) => it.trans), show, ini_ui_language],
  () => {
    if (!show.value) {
      return
    }
    const couldTransAios = Object.values(aios).filter((it) => it.trans)
    transOptions.value = [
      ...(isCn.value
        ? [
            {
              label: '百度翻译',
              value: 'baidu_trans',
              sup: 'Beta',
              tooltip: '使用的是网页版百度翻译',
            },
          ]
        : []),
      ...couldTransAios.map((it) => ({
        label: `${it.fromChina && isCn.value ? it.name : it.key}`,
        sup: it.unstableTrans ? 'Beta' : undefined,
        value: it.key,
      })),
    ]
  },
  { deep: true, immediate: true },
)

const settingJson = ref<string>()

function resetSetting() {
  postRnMessage({
    type: 'SETTING_DIALOG_CLOSE',
  })
  localStorage.clear()
  window.location.reload()
}

function onClose() {
  postRnMessage({
    type: 'SETTING_DIALOG_CLOSE',
  })
}
</script>
<template>
  <CpModal
    v-model:show="show"
    :title="t('setting.system-setting')"
    transform-origin="topright"
    @close="onClose"
  >
    <setting-content>
      <setting-group>
        <setting-group-name>{{ t('setting.general') }}</setting-group-name>
        <setting-box>
          <setting-line>
            <setting-name>{{ t('setting.theme') }}</setting-name>
            <CpOptions
              :value="ini_ui.theme"
              :options="themeOptions"
              more-icon
              @click="(val) => switchTheme(val)"
            />
          </setting-line>
          <setting-line>
            <setting-name>{{ t('setting.end_less_mode') }}</setting-name>
            <CpOptions
              :value="ini_ui.layout"
              :options="layoutOptions"
              more-icon
              @click="(val) => switchLayout(val)"
            />
          </setting-line>
          <setting-line v-if="!mobileMode">
            <setting-name>{{ t('setting.layout-bar-position') }}</setting-name>
            <CpOptions
              :value="ini_ui_header.position"
              :options="headerPositionOptions"
              more-icon
              @click="(val) => switchHeaderPosition(val)"
            />
          </setting-line>
          <setting-line>
            <setting-name>{{ t('setting.layout-bar-size') }}</setting-name>
            <CpOptions
              :value="ini_ui_header.size"
              :options="headerSizeOptions"
              more-icon
              @click="(val) => switchHeaderSize(val)"
            />
          </setting-line>
          <setting-line v-if="!mobileMode && ini_ui_language != 'en'">
            <setting-name>{{ t('setting.translate-engine') }}</setting-name>
            <CpOptions
              :value="translate_setting.engine"
              :options="transOptions"
              more-icon
              @click="(val) => switchTranslateEngine(val)"
            />
          </setting-line>
          <setting-line style="position: relative">
            <setting-name>{{ t('setting.language') }}</setting-name>
            <CpOptions
              :value="ini_ui_language"
              :options="languareOptions"
              more-icon
              @click="(lang) => switchLanguage(lang)"
            />
          </setting-line>
        </setting-box>
      </setting-group>
      <setting-group>
        <setting-group-name>
          {{ t('setting.advanced-settings') }}
          <button @click="resetSetting">{{ t('setting.reset-settings') }}</button>
        </setting-group-name>
        <textarea
          rows="6"
          :placeholder="t('setting.configuration-placeholder')"
          v-model="settingJson"
        />
      </setting-group>
      <setting-group>
        <setting-group-name>
          {{ t('setting.log') }}
          <button @click="toggleTranslator">{{ t('setting.show-translator') }}</button>
        </setting-group-name>
        <log-box id="log-box">
          <scroll-container>
            <template v-for="(log, i) in logs" :key="i">
              <span>{{ log }}</span>
            </template>
          </scroll-container>
        </log-box>
      </setting-group>
      <setting-group>
        <setting-group-name>{{ t('setting.usage') }}</setting-group-name>
        <setting-box class="notes">
          <span> {{ t('setting.desc') }} </span>
          <br />
          {{ t('setting.notes') }}
          <ul>
            <li>{{ t('setting.plugin-tip') }}</li>
            <li>
              {{ t('setting.login-tip') }}
            </li>
          </ul>
        </setting-box>
      </setting-group>
      <setting-group>
        <setting-group-name>
          <a target="_blank" href="https://github.com/HerbLuo/xmy-ai"> Github </a>
        </setting-group-name>
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
  max-height: 580px;
  overflow-y: scroll;
}
setting-group {
  display: flex;
  flex-direction: column;
}
setting-group-name {
  display: flex;
  padding: 16px 0px;
  justify-content: space-between;
}
setting-box {
  display: flex;
  flex-direction: column;
  background-color: #0001;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 15px;
}
setting-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 42px;
  border-bottom: 1px solid #ccc;
}
setting-line:last-child {
  border-bottom: 0;
}
textarea {
  font-size: 12px;
  resize: none;
  outline: none;
  color: #000b;
  background-color: #0001;
  border-radius: 6px;
  padding: 8px 12px;
  border: 1px solid #666;
}
.dark textarea {
  caret-color: #aaa;
  color: #aaa;
}
.notes {
  padding: 8px 12px;
}
a {
  color: #0006;
}
.dark a {
  color: #fff6;
}
button {
  color: inherit;
  font-size: 16px;
  padding: 4px 16px;
  background-color: #0001;
  border: var(--normal-border);
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
.not-allowed button {
  cursor: not-allowed;
}
log-box {
  border-radius: 6px;
  padding: 8px 12px;
  width: 100%;
  height: 88px;
  font-size: 12px;
  color: #000b;
  background-color: #0001;
  overflow-y: scroll;
}

log-box scroll-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.dark log-box {
  color: #aaa;
}
@media (max-width: 450px) {
  setting-content {
    width: 100%;
    height: 100%;
  }
}
</style>
