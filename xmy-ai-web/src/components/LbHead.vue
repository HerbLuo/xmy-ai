<script setup lang="ts">
import { ini_ui, theme } from '@/state/ui'
import { ini_ui_header } from '@/state/uiHeader'
import { ini_ui_layout_switching, switchLayout } from '@/state/uiLayoutSwitching'
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import LbSettingModal from './LbSettingModal.vue'
import { toggleSplitView, ini_split_view, setSplitViewAi } from '@/state/splitView'
import CpOptions, { type Option } from './CpOptions.vue'
import { aios, useAio } from '@/state/aios'
import { mobileMode } from '@/state/env'
import { useI18n } from 'vue-i18n'
import { isCn } from '@/state/i18n'

const { t } = useI18n()

const isEdge = navigator.userAgent.includes('Edg/')

const settingModalVisible = ref(false)
const aiOptions = ref<Option[]>([])
watch(
  aios,
  () => {
    const options = Object.values(aios).map((aio) => ({
      label: aio.fromChina && isCn.value ? aio.name : aio.key,
      value: aio.key,
    }))
    options.push({
      label: t('more'),
      value: 'more',
    })
    aiOptions.value = options
  },
  { immediate: true },
)
async function onSplitViewAiSelected(val: string) {
  if (val === 'more') {
    const { moreAios } = await import('../state/aiosMore')
    aiOptions.value = aiOptions.value.filter((it) => it.value !== 'more')
    const moreOptions = Object.values(moreAios()).map((aio) => ({
      label: aio.fromChina && isCn.value ? aio.name : aio.key,
      value: aio.key,
    }))
    aiOptions.value.push(...moreOptions)
  } else {
    useAio(val, (aio) => {
      setSplitViewAi(
        val,
        (aio?.fromChina && isCn.value ? aio?.name : aio?.key) || 'unknown',
        aio?.url,
      )
    })
  }
}

const splitViewTourVisible = ref(false)
const LbSplitViewTour = defineAsyncComponent(() => import('./LbSplitViewTour.vue'))
function showSplitViewTour() {
  splitViewTourVisible.value = true
}
function hideSplitViewTour() {
  setTimeout(() => {
    splitViewTourVisible.value = false
  }, 201)
}

const top = computed(() => ini_ui_header.position === 'top')
const logo = computed(() => {
  return theme.value === 'dark' ? '/logo_dark.png' : 'logo_light.png'
})
const iconSize = computed(() => {
  if (ini_ui_header.size === 'small') {
    return 18
  }
  if (ini_ui_header.size === 'middle') {
    return 28
  }
  return 38
})

function onSettingClick() {
  settingModalVisible.value = true
}
Object.assign(window, { onSettingClick })
</script>

<template>
  <header :class="`${top ? 'top' : 'left'} ${ini_ui_header.size} ${mobileMode ? 'mm' : ''}`">
    <h1 v-if="top">
      <img :src="logo" /><span>{{ t('header.title') }}</span>
    </h1>
    <h1 v-else>
      <img :src="logo" /><span>{{ t('header.title-line1') }}</span
      ><span>{{ t('header.title-line2') }}</span
      ><span>{{ t('header.title-line3') }}</span>
    </h1>
    <div :style="{ width: `${iconSize}px`, height: `${iconSize}px` }"></div>
    <layout-switching v-if="ini_ui.layout === 'large_screen' && !mobileMode">
      <button
        v-for="ls in ini_ui_layout_switching"
        :key="ls.key"
        :class="{ actived: ls.actived, icon: true }"
      >
        <cp-svg-icon :name="ls.icon" :size="iconSize" @click="switchLayout(ls.key)" />
      </button>
    </layout-switching>
    <header-right>
      <split-view v-if="!mobileMode">
        <span v-if="ini_split_view.enabled">{{ t('header.sv-before-option') }}</span>
        <CpOptions
          v-if="ini_split_view.enabled"
          :value="ini_split_view.ai"
          :options="aiOptions"
          :default="ini_split_view.aiLabel"
          :href="ini_split_view.url"
          @click="onSplitViewAiSelected"
        />
        <span v-if="ini_split_view.enabled">{{ t('header.sv-after-option') }}</span>
        <button @click="toggleSplitView" :class="{ actived: ini_split_view.enabled }">
          {{ isEdge ? t('header.sv-split-screen') : t('header.sv-split-view') }}
        </button>
        <span v-if="ini_split_view.enabled">{{ t('header.sv-after-sv') }}</span>
        <sup v-if="ini_split_view.enabled" @click="showSplitViewTour">?</sup>
      </split-view>
      <button class="icon" :tooltip="t('settingText')" position="left" @click="onSettingClick">
        <cp-svg-icon name="setting" :size="iconSize" />
      </button>
    </header-right>
    <LbSettingModal v-model="settingModalVisible" />
    <LbSplitViewTour v-if="splitViewTourVisible" class="async-tour" @hidden="hideSplitViewTour" />
  </header>
</template>

<style lang="css" scoped>
header {
  background-color: #004585;
  color: white;
  display: flex;
}
.dark header {
  background-color: #3d3d3d;
}

header.top {
  width: 100vw;
  height: 50px;
  padding: 0 16px;
  flex-direction: row;
  align-items: center;
  border-bottom: var(--dark-border);
  justify-content: space-between;
}

header.top.mm {
  height: 38px;
}

header.left {
  width: 50px;
  height: 100%;
  padding: 16px 0;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border-right: var(--dark-border);
}

img {
  width: 66px;
  height: 66px;
}

h1 {
  position: absolute;
  display: flex;
  align-items: center;

  font-weight: 500;
  font-family:
    'YouYuan',
    /*  Windows 幼圆  */ 'Yuanti SC',
    /*  Mac 圆体  */ 'Hiragino Maru Gothic Pro',
    /*  Mac 丸ゴシック  */ 'Yuji Mai',
    /*  Linux 圆体  */ 'AR PL UMing CN',
    /*  Linux 中易字体  */ 'WenQuanYi Micro Hei',
    /*  Linux 文泉驿  */ sans-serif; /*  最后回退到无衬线字体  */
}

header.top h1 {
  font-size: 1.25rem;
}

header.left h1 > span:nth-child(2) {
  font-size: 1.25rem;
}

header.left h1 > span:nth-child(3) {
  font-size: 1rem;
}

header.left h1 > span:nth-child(4) {
  opacity: 0;
  font-size: 0.85rem;
}

header.left h1 {
  left: 0;
  top: 0;
  display: inline-flex;
  width: 50px;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 620px) {
  header.top h1 {
    left: 2px;
  }
  header.left h1 {
    top: 2px;
  }
}

.dark h1 {
  color: #bbb;
}

layout-switching {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

header.top layout-switching {
  flex-direction: row;
}

header.left layout-switching {
  flex-direction: column;
}

button {
  color: white;
  cursor: pointer;
  background-color: #eee0;
}

.dark button {
  color: #aaa;
}

button:hover,
button:hover,
button.actived {
  color: #1890ff;
  background-color: #eee9;
}

.dark button:hover,
.dark button:hover,
.dark button.actived {
  color: #555;
  background-color: #eee9;
}

header.top.middle {
  height: 25px;
}
header.left.middle {
  width: 25px;
}
header.left.middle h1 {
  width: 25px;
}
header.left.middle h1 span {
  text-align: center;
}
.middle img {
  width: 33px;
  height: 33px;
}
.middle button.icon {
  width: 22px;
  height: 22px;
  border-radius: 4px;
}

header.top.small {
  height: 15px;
}
header.left.small {
  width: 15px;
}
header.left.small h1 {
  width: 15px;
}
.small h1 span {
  font-size: 16px;
}
/* header.top.small {
  width: 15px;
} */
.small img {
  width: 20px;
  height: 20px;
}
.small button.icon {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

header-right {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
}
header.left header-right {
  width: 100%;
  height: unset;
}
split-view {
  width: 328px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 12px;
  position: absolute;
  right: 38px;
  margin-right: 12px;
}
header.left split-view {
  flex-direction: column;
  height: 280px;
  width: 100%;
  right: 0;
  bottom: 38px;
  margin-right: 0;
  margin-bottom: 26px;
}
split-view span {
  margin: 2px;
}
split-view button {
  width: 80px;
  padding: 2px 2px;
  border-radius: 4px;
}
header.left split-view button {
  width: 38px;
}
split-view :deep(opt-cur) {
  width: fit-content;
}
split-view :deep(opt-box:hover opt-cur) {
  width: 98px;
}
split-view sup {
  display: inline-block;
  margin-bottom: 12px;
  margin-left: -3px;
  font-size: 14px;
  width: 20px;
  height: 20px;
  line-height: 16px;
  text-align: center;
  border: 2px solid #aaa;
  border-radius: 50%;
  scale: 66%;
  cursor: pointer;
}

@media (max-width: 620px) {
  h1 {
    pointer-events: none;
  }
  h1 span {
    font-size: 18px;
  }
}
</style>
