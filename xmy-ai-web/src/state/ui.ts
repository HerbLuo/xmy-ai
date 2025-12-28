import { loadState, saveState } from '@/utils/storage-persistor'
import { computed, reactive, ref, watch } from 'vue'
import { unwrap, type CheckResult } from './types'
import { confirmError } from '@/utils/error'
import { largeScreen } from './env'

const UiStorageKey = 'lambs_ini_ui'

export type Theme = 'auto' | 'light' | 'dark'
export type Layout = 'large_screen' | 'small_screen'
export type IniUi = {
  theme: Theme
  layout: Layout
}
const storage = loadState<IniUi>(UiStorageKey)
export const ini_ui: IniUi = reactive(
  unwrap(typeCheck(storage)) || {
    theme: 'auto',
    layout: largeScreen() ? 'large_screen' : 'small_screen',
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

function typeCheck(data: IniUi | null): CheckResult<IniUi | null> {
  if (!data) {
    return { data: null }
  }
  if (!['auto', 'light', 'dark'].includes(data.theme)) {
    return {
      error: '属性`ini.ui.theme`的值只能为`auto`, `light`或者`dark`',
    }
  }
  if (!['large_screen', 'small_screen'].includes(data.layout)) {
    return {
      error: '属性`ini.ui.layout`的值只能为`large_screen`或者`small_screen`',
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
