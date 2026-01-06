<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CpModal from './CpModal.vue'
import { aios, removeAio, replaceAio, useAio, type Aio } from '@/state/aios'
import { confirmError, tipError } from '@/utils/error'
import { info } from '@/utils/message'
import { ini_split_view, setSplitViewAi } from '@/state/splitView'
import { largeScreen, mobileMode } from '@/state/env'
import { useI18n } from 'vue-i18n'
import { ini_ui_language, isCn } from '@/state/i18n'

const show = defineModel<boolean>()
const props = defineProps<{
  aiKey?: string
}>()
const emit = defineEmits(['ok', 'cancel'])

const currentAi = ref<string>()
const currentConfig = ref<string>()
const currentConfigAi = ref<string>()

const { t } = useI18n()
watch(props, () => (currentAi.value = props.aiKey), { immediate: true })

let fetched = false
const loadMore = ref(0)
const aiList = ref(Object.values(aios))

watch(aios, () => {
  aiList.value = Object.values(aios)
  fetched = false
  loadMore.value++
})

function setCurrentConfig(aio?: Aio) {
  if (!aio) {
    currentConfig.value = ''
    currentConfigAi.value = ''
    return
  }
  const json = JSON.stringify(
    aio,
    (key, val) => {
      if (typeof val === 'function') {
        return `@@_F_]]${val.toString()}]]_F_@@`
      }
      return val
    },
    2,
  )

  currentConfigAi.value = aio.key
  currentConfig.value = json
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/"@@_F_]]/g, '')
    .replace(/]]_F_@@"/g, '')
}

watch([show, props, loadMore], async (show) => {
  if (show) {
    if (!fetched) {
      const { moreAios } = await import('../state/aiosMore')
      const keys = aiList.value.map((it) => it.key)
      aiList.value.push(...Object.values(moreAios()).filter((it) => !keys.includes(it.key)))
      fetched = true
    }
    setTimeout(() => {
      scrollIntoView()
    }, 100)
    setCurrentConfig(aiList.value.find((ai) => ai.key === props.aiKey))
  }
})

function scrollIntoView() {
  const el = document.querySelector('#more-ai-table input[checked]')
  el?.closest('tr')?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}

function onCheck(ai: Aio) {
  currentAi.value = ai.key
  setCurrentConfig(ai)
}

function tryEval(json: string) {
  try {
    const geval = eval
    return geval('(' + json + ')')
  } catch (e: unknown) {
    throw confirmError(t('messages.parse-json-failed') + e)
  }
}

function saveConfig() {
  const configJsonStr = currentConfig.value
  if (!configJsonStr) {
    throw tipError(t('messages.empty-configuration'))
  }
  const config = tryEval(configJsonStr)
  if (config.key !== currentAi.value) {
    throw confirmError(t('messages.key-changed-when-save'))
  }
  replaceAio(config)
  info(t('messages.saved-successfully'))
}

function removeConfig() {
  if (!currentConfigAi.value) {
    throw tipError(t('messages.no-current-when-remove'))
  }
  removeAio(currentConfigAi.value)
  if (currentAi.value === currentConfigAi.value) {
    currentAi.value = aiList.value[0]?.key
  }
  info(t('messages.deleted-successfully'))
}

function addConfig() {
  const configJsonStr = currentConfig.value
  if (!configJsonStr) {
    throw tipError(t('messages.empty-configuration'))
  }
  const config = tryEval(configJsonStr)
  if (aiList.value.find((ai) => config.key === ai.key)) {
    throw confirmError(t('messages.key-exists-when-add'))
  }
  replaceAio(config)
  aiList.value.push(config)
  currentAi.value = config.key
  setTimeout(() => {
    scrollIntoView()
    info(t('messages.added-successfully'))
  }, 100)
}

function enableInSplitView() {
  if (!currentConfigAi.value) {
    throw confirmError(t('messages.unknown-option'))
  }

  useAio(currentConfigAi.value, (aio) => {
    if (!aio) {
      throw confirmError(t('messages.unable-find-ai-save-first', { aiKey: currentConfigAi.value }))
    }
    setSplitViewAi(aio?.key, aio.fromChina && isCn.value ? aio?.name : aio?.key, aio?.url)
    info(
      t('messages.split-view-enabled-successfully', {
        aiName: aio.fromChina && isCn.value ? aio.name : aio.key,
      }),
    )
  })
}

function onOk() {
  emit('ok', currentAi.value)
  show.value = false
}
function onCancel() {
  emit('cancel')
  show.value = false
}

const smallFontSize = computed(() => {
  return ['ja-JP'].includes(ini_ui_language.value)
})
</script>

<template>
  <CpModal
    v-model:show="show"
    :title="t('more') + 'AI'"
    :onOk="onOk"
    :onCancel="onCancel"
    @close="onCancel"
  >
    <ai-table id="more-ai-table" :class="{ 'small-font-size': smallFontSize }">
      <table-container class="macos-scrollbar">
        <table border="1">
          <thead>
            <tr>
              <th>
                <th-bg><span>　</span></th-bg>
              </th>
              <th>
                <th-bg><span>Name</span></th-bg>
              </th>
              <th v-if="largeScreen()">
                <th-bg><span>URL</span></th-bg>
              </th>
              <th>
                <th-bg><span>Tags</span></th-bg>
              </th>
              <th v-if="largeScreen()">
                <th-bg><span>Action</span></th-bg>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ai in aiList"
              :key="ai.key"
              :disabled="ai.onlySplitViewMode"
              @click="ai.onlySplitViewMode ? false : onCheck(ai)"
            >
              <td>
                <input
                  type="radio"
                  name="aiActived"
                  :checked="ai.key === currentAi"
                  :disabled="!mobileMode && ai.onlySplitViewMode"
                />
              </td>
              <td>{{ ai.fromChina && isCn ? ai.name : ai.key }}</td>
              <td v-if="largeScreen()">{{ ai.url }}</td>
              <td>
                <ai-tag v-if="!mobileMode && ai.onlySplitViewMode" key="osvm">{{
                  t('more-ai-modal.only-split-view-is-supported')
                }}</ai-tag>
                <ai-tag
                  v-for="tag in ai.tags"
                  :key="tag"
                  :tooltip="
                    tag === 'Free'
                      ? t('more-ai-modal.free-definition')
                      : tag === t('FNL')
                        ? t('more-ai-modal.FNL-refers')
                        : ''
                  "
                  >{{ tag }}</ai-tag
                >
              </td>
              <td v-if="largeScreen()">
                <button @click.stop="setCurrentConfig(ai)">
                  {{ t('more-ai-modal.view-configuration') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </table-container>
      <ai-config-box v-if="largeScreen()">
        <ai-config-title>
          <ai-config-title-left>⚠️ {{ t('more-ai-modal.high-risk-tip') }}</ai-config-title-left>
          <ai-config-title-right>
            <button
              v-if="!mobileMode"
              :class="{ actived: currentConfigAi === ini_split_view.ai && ini_split_view.enabled }"
              @click="enableInSplitView"
            >
              {{ t('more-ai-modal.enable-in-split-view') }}
            </button>
            <button @click="saveConfig">{{ t('save') }}</button>
            <button @click="addConfig">{{ t('add') }}</button>
            <button @click="removeConfig">{{ t('remove') }}</button>
          </ai-config-title-right>
        </ai-config-title>
        <textarea v-model="currentConfig" />
      </ai-config-box>
    </ai-table>
  </CpModal>
</template>

<style lang="css" scoped>
ai-table {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 780px;
  height: 80vh;
  max-height: 580px;
  padding: 22px;
}

.small-font-size {
  font-size: 12px;
}

table-container {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: auto;
  border-radius: 6px;
  margin-bottom: 22px;
  border-top: var(--normal-border);
  border-left: var(--normal-border);
  border-bottom: var(--normal-border);
}

table {
  border-collapse: collapse;
  border: 1px solid #ccc;
  margin: -1px;
  border-radius: 6px;
  width: 100%;
}

thead {
  position: sticky;
  top: 0;

  text-align: left;
}

th::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: #aaa;
}

tbody tr {
  cursor: pointer;
}

tr[disabled] {
  cursor: not-allowed;
}

td {
  padding: 1px 6px;
  color: #555;
}

.dark td {
  color: #aaa;
}

th {
  border-top: none;
  border-bottom: none;
  padding: 0;
  color: #555;
}

.dark th {
  color: #aaa;
}

th-bg {
  display: block;
  width: 100%;
  height: 100%;
  margin-top: -1px;
  padding: 1px 7px 1px 6px;
  background-color: #fffa;
  backdrop-filter: blur(6px);
}

.dark th-bg {
  background-color: #3d3d3daa;
}

.dark input[type='radio'] {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-clip: content-box;
  border: 0;
  background-color: #aaa;
}

.dark input[type='radio']:checked {
  background-color: #3d3d3d;
  padding: 4px;
  border: 2px solid #aaa;
}

td button {
  padding: 1px 0px;
  color: #555;
}

.dark td button {
  color: #aaa;
}

td:nth-child(1) {
  text-align: center;
}

ai-tag {
  display: inline-block;
  vertical-align: middle;
  font-size: 12px;
  margin: -4px 8px 0 0;

  background-color: #0001;
  padding: 1px 6px;
  border-radius: 3px;
}

.dark ai-tag {
  background-color: #0006;
}

ai-config-box {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  padding: 6px;
  border-radius: 6px;
  border: var(--normal-border);
}

ai-config-box button {
  padding: 2px 6px;
  color: #333;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  border: var(--normal-border);
  background-color: transparent;
  border-radius: 4px;
  margin-left: 8px;
}

.dark ai-config-box button {
  color: #aaa;
}

ai-config-box button:hover {
  background-color: #aaa;
  color: #fff;
}

.dark ai-config-box button:hover {
  background-color: #eee9;
  color: #333;
}

ai-config-title {
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ai-config-title-left {
  max-width: 366px;
} */

ai-config-title > * {
  margin-left: 2px;
}

span {
  display: contents;
}

textarea {
  margin-top: 8px;
  flex: 1;
  resize: none;
  border: var(--normal-border);
  outline: none;
  border-radius: 4px;
  padding: 6px;
  background-color: transparent;
}

.dark textarea {
  color: #aaa;
}

@media (max-width: 780px) {
  ai-table {
    width: 620px;
  }
}
@media (max-width: 620px) {
  ai-table {
    width: 100%;
  }

  table-container {
    height: 100%;
  }
}
</style>
