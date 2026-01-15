import { loadState, saveState } from '@/utils/storage-persistor'
import { computed, reactive, ref, watch } from 'vue'
import { unwrap, type CheckResult } from './types'
import { confirmError } from '@/utils/error'
import { largeScreen } from './env'
import { i18n } from './i18n'

const UiStorageKey = 'lambs_ini_ui'

export type Theme = 'auto' | 'light' | 'dark'
export type Layout = 'large_screen' | 'small_screen'
export type Visibility = 'visible' | 'hidden'
export type IniUi = {
  theme: Theme
  layout: Layout
  translatorVisibility: Visibility
}
const storage = loadState<IniUi>(UiStorageKey)
export const ini_ui: IniUi = reactive(
  unwrap(typeCheck(storage)) || {
    theme: 'auto',
    layout: largeScreen() ? 'large_screen' : 'small_screen',
    translatorVisibility: 'hidden',
  },
)

export const isSmallScreen = computed(() => ini_ui.layout === 'small_screen')

export const theme = ref(ini_ui.theme)
watch(
  () => ini_ui.theme,
  () => {
    if (ini_ui.theme === 'auto') {
      const darkBrowser =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = darkBrowser ? 'dark' : 'light'
    } else {
      theme.value = ini_ui.theme
    }
  },
  { immediate: true },
)

if (window.matchMedia as unknown) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (ini_ui.theme === 'auto') {
      theme.value = e.matches ? 'dark' : 'light'
    }
  })
}

export function switchTheme(theme: Theme) {
  ini_ui.theme = theme

  saveState(UiStorageKey, ini_ui)
}

export function switchLayout(layout: Layout) {
  ini_ui.layout = layout

  saveState(UiStorageKey, ini_ui)
}

export function toggleTranslator() {
  ini_ui.translatorVisibility = ini_ui.translatorVisibility === 'visible' ? 'hidden' : 'visible'
}

function typeCheck(data: IniUi | null): CheckResult<IniUi | null> {
  if (!data) {
    return { data: null }
  }
  if (!['auto', 'light', 'dark'].includes(data.theme)) {
    return {
      error: i18n.global.t('typecheck.ui-theme'),
    }
  }
  if (!['large_screen', 'small_screen'].includes(data.layout)) {
    return {
      error: i18n.global.t('typecheck.ui-layout'),
    }
  }
  return {
    data,
  }
}

export function replaceUi(data: IniUi) {
  const checked = typeCheck(data)
  if (checked.error) {
    throw confirmError(checked.error)
  }
  ini_ui.theme = data.theme

  saveState(UiStorageKey, ini_ui)
}
