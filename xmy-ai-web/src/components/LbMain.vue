<script setup lang="ts">
import {
  copyStorage,
  appendExecutorToIframe,
  type HostnameAndTokenLocalStorageNames,
} from '@/action/message'
import { aios, onLoadScript, type Aio } from '@/state/aios'
import { currentLayoutSwitching } from '@/state/uiLayoutSwitching'
import { currentPlaygroundPages, switchAiPage } from '@/state/uiPlaygroundsCurrentPlaygroundPages'
import { type CSSProperties, defineAsyncComponent, onMounted, ref } from 'vue'
import LbAiSettingModal from './LbAiSettingModal.vue'
import { mobileMode } from '@/state/env'
import { isSmallScreen } from '@/state/ui'
import LbMoreAiModal from './LbMoreAiModal.vue'
import { confirmError } from '@/utils/error'
import { log } from '@/state/log'
import { useI18n } from 'vue-i18n'
import { isCn } from '@/state/i18n'
import { EVENT_Iframe_Evaler_Preapred, eventBus } from '@/utils/EventBus'

const aiIndex = ref(-1)
const aiKey = ref('')
const aiName = ref('')
const settingModalVisible = ref(false)
const { t } = useI18n()

const error = ref(false)
const AsyncTour = defineAsyncComponent(() => import('./LbTour.vue'))
onMounted(() => {
  setTimeout(() => {
    if (!document.querySelector('.by_xmy_plugin') && !mobileMode.value) {
      error.value = true
    } else {
      log.append('Lambs AI Loaded.')
    }
  })
})

async function onIframeLoad(page: Aio) {
  // Allow Eval
  await appendExecutorToIframe()

  eventBus.emit(EVENT_Iframe_Evaler_Preapred, true)

  // Copy LocalStorage
  const urlAndTokenLocalStorageNames: HostnameAndTokenLocalStorageNames[] = []
  for (const aio of currentPlaygroundPages.value) {
    const storage = aio?.storage || []
    if (storage.length) {
      urlAndTokenLocalStorageNames.push({
        hostname: new URL(aio.url).hostname,
        storage,
      })
    }
  }

  if (urlAndTokenLocalStorageNames.length) {
    const resp = await copyStorage(urlAndTokenLocalStorageNames)
    console.log("Ai pages' storage prepared: ", resp, urlAndTokenLocalStorageNames)
  }
  if (page.onLoad) {
    onLoadScript(page.key, page.url, page.onLoad)
  }
}

const zoomIn = ref<boolean[]>([])
const zoomStyle = ref<CSSProperties>({})
function onZoomClick(i: number) {
  const count = currentLayoutSwitching.value.count
  const lsZI = currentLayoutSwitching.value.zoomIn
  if (count != lsZI?.length) {
    throw confirmError(t('messages.not-support-zoom'))
  }

  const to = !zoomIn.value[i]
  for (const j in zoomIn.value) {
    zoomIn.value[j] = !to
  }
  zoomIn.value[i] = to
  zoomStyle.value = zoomIn.value[i] ? lsZI[i] || {} : {}
}

function onRefreshClick(key: string) {
  const frame = document.querySelector<HTMLIFrameElement>(`#${key} iframe`)
  if (frame) {
    frame.src = frame.src
  }
}

function onSettingClick(key: string, name: string) {
  aiKey.value = key
  aiName.value = name
  settingModalVisible.value = true
}

const hover = ref<boolean[]>([])

const moreAiVisible = ref(false)
function onMoreClick(i: number, key: string) {
  aiIndex.value = i
  aiKey.value = key
  moreAiVisible.value = true
}
</script>
<template>
  <main
    :class="`${isSmallScreen ? 'small' : 'large'}-screen macos-scrollbar`"
    :style="isSmallScreen ? {} : { ...currentLayoutSwitching.style, ...zoomStyle }"
  >
    <ai-page v-for="(page, i) in currentPlaygroundPages" :key="page.key" :id="page.key">
      <ai-switcher
        :class="{ 'macos-scrollbar': true, hover: hover[i] }"
        @mouseenter="mobileMode ? null : (hover[i] = true)"
        @mouseleave="mobileMode ? null : (hover[i] = false)"
        @click.capture="mobileMode ? (hover[i] = !hover[i]) : null"
      >
        <switcher-current>{{ page.fromChina && isCn ? page.name : page.key }}</switcher-current>
        <switcher-options>
          <template v-for="(aio, key) in aios" :key="key">
            <switcher-option v-if="key !== page.key" @click="switchAiPage(i, key)">
              {{ aio.fromChina && isCn ? aio.name : aio.key }}
            </switcher-option>
          </template>
          <switcher-option key="more" @click="onMoreClick(i, page.key)">
            {{ t('more') }}...
          </switcher-option>
        </switcher-options>
      </ai-switcher>
      <ai-buttons>
        <ai-button :tooltip="t('refresh')" position="left" @click="onRefreshClick(page.key)">
          <cp-svg-icon name="refresh" :size="19" />
        </ai-button>
        <ai-button
          :tooltip="t('zoom-in')"
          position="left"
          class="zoom-icon"
          @click="onZoomClick(i)"
        >
          <cp-svg-icon :name="zoomIn[i] ? 'zoom_out' : 'zoom_in'" :size="19" />
        </ai-button>
        <ai-button
          :tooltip="t('settingText')"
          position="left"
          @click="onSettingClick(page.key, page.fromChina && isCn ? page.name : page.key)"
        >
          <cp-svg-icon name="setting" :size="19" />
        </ai-button>
      </ai-buttons>
      <iframe @load="onIframeLoad(page)" :src="page.url" />
    </ai-page>
    <install-plugin-tip v-if="error">
      {{ t('messages.no-plugin') }}
      <AsyncTour />
    </install-plugin-tip>
    <LbMoreAiModal
      v-model="moreAiVisible"
      :ai-key="aiKey"
      @ok="(key) => switchAiPage(aiIndex, key)"
    />
    <LbAiSettingModal v-model="settingModalVisible" :ai-name="aiName" :ai-key="aiKey" />
  </main>
</template>
<style lang="css" scoped>
main.large-screen {
  flex: 1;
  margin-bottom: 8px;

  display: grid;
  gap: 8px;
}
main.small-screen {
  display: flex;
  padding: 0;
  flex: 1;
  overflow-x: scroll;
  overflow-y: hidden;
}
install-plugin-tip {
  position: fixed;
  top: 60px;
  right: 10px;
  width: 320px;
  background: #333b;
  color: #eee;
  font-size: 15px;
  border-radius: 4px;
  padding: 10px;
  box-shadow: var(--box-shadow);
}
iframe {
  border-radius: 6px;
  width: 100%;
  height: 100%;
  border: 0;
}
.dark iframe {
  border: var(--dark-border);
}
ai-page {
  position: relative;
}
.small-screen ai-page {
  padding: 12px 0 12px 12px;
  height: 100%;
  width: 90vw;
  flex: 0 0 auto;
}
@media (min-width: 380px) {
  .small-screen ai-page {
    width: 80vw;
  }
}
@media (min-width: 680px) {
  .small-screen ai-page {
    width: 70vw;
  }
}
@media (min-width: 800px) {
  .small-screen ai-page {
    width: 60vw;
  }
}
@media (min-width: 960px) {
  .small-screen ai-page {
    width: 50vw;
  }
}
@media (min-width: 1200px) {
  .small-screen ai-page {
    width: 40vw;
  }
}
@media (min-width: 1600px) {
  .small-screen ai-page {
    width: 30vw;
  }
}
ai-switcher,
ai-buttons {
  position: absolute;
  cursor: pointer;
  color: #000;
  font-size: 12px;
  background-color: #fafafa;
  opacity: 0.7;
}
ai-switcher {
  border-radius: 6px 0;
  box-shadow: var(--box-shadow);
}
ai-buttons {
  display: flex;
  right: 0;
  height: 20px;
  border-radius: 0 6px;
  border-left: var(--normal-border);
  border-bottom: var(--normal-border);
  box-shadow:
    0 0 0 0px #fff,
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1),
    0 0 0 calc(1px + 0px) rgb(209 213 219 / 0.3),
    0 0 #0000;
}
ai-button {
  transition: transform 0.1s ease;
  transform: scale(100%);
  transform-origin: center;
  width: 20px;
  height: 20px;
}
.dark ai-switcher,
.dark ai-buttons {
  color: #eee;
  background-color: #585858;
  border: 0;
}
ai-switcher.hover {
  background-color: #fff;
  opacity: 1;
  border-radius: 0;
}
ai-button:hover {
  transform: scale(120%);
  background-color: transparent;
  opacity: 1;
}
ai-button:not(.zoom-icon) > svg-ico {
  transform: rotate(0);
  transition: transform 0.5s ease;
}
ai-button:hover > svg-ico {
  transform: rotate(360deg);
}
.dark ai-switcher.hover {
  background-color: #585858;
}
ai-switcher switcher-options {
  display: flex;
  overflow-x: hidden;
  overflow-y: scroll;
  width: 0;
  height: 0;
  opacity: 0;
  transition:
    0.3s width ease,
    0.3s height ease,
    0.3s opacity ease;
  flex-direction: column;
}
ai-switcher.hover switcher-options {
  opacity: 1;
  width: 98px;
  height: 198px;
}
ai-switcher.hover switcher-option:first-child {
  border-top: var(--actived-border);
}
switcher-current {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 22px;
  border-right: var(--normal-border);
  border-bottom: var(--normal-border);
  padding: 0 6px;
  border-radius: 6px 0;
  pointer-events: none;
}
.dark switcher-current {
  border: 0;
}
ai-switcher.hover switcher-current {
  color: var(--actived-color);
  border-radius: 0;
  margin-bottom: -1px;
  border: var(--actived-border);
  width: 98px;
  height: 32px;
  pointer-events: all;
}
switcher-option {
  flex: 0 0 auto;
  border-top: var(--normal-border);
  border-right: var(--normal-border);
  width: 98px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition:
    0.3s color ease,
    0.2s font-size ease;
  font-size: 1em;
}
switcher-option:last-child {
  border-bottom: var(--normal-border);
}
switcher-option:hover {
  font-size: 1.1em;
  color: var(--actived-color);
  border-top: var(--actived-border);
  border-right: var(--actived-border);
  box-shadow:
    0 0 0 0px #fff,
    0 0 0 calc(1px + 0px) rgb(209 213 219 / 0.3),
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1),
    0 0 #0000;
}
.dark switcher-option:hover {
  border-left: var(--actived-border);
}
switcher-option:last-child:hover {
  border-bottom: var(--actived-border);
}

switcher-option:hover + switcher-option {
  border-top: var(--actived-border);
}
</style>
