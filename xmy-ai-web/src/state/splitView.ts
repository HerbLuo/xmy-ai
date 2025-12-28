import { loadState, saveState } from '@/utils/storage-persistor'
import { reactive, watch } from 'vue'
import { unwrap, type CheckResult } from './types'
import { confirmError } from '@/utils/error'
import { allowSplitViewCsp, refreshSplitView, type AllowIframeConfig } from '@/action/message'

const SplitViewStorageKey = 'lambs_ini_split_view'

export type SplitView = {
  enabled: boolean
  ai: string | null
  aiLabel: string
  url?: string | undefined
}
const storage = loadState<SplitView>(SplitViewStorageKey)
export const ini_split_view: SplitView = reactive(
  unwrap(typeCheck(storage)) || {
    enabled: false,
    ai: null,
    aiLabel: '-',
  },
)

async function cspAndRefresh(url: string) {
  const allowIframeConfig: AllowIframeConfig = {
    regexFilters: [],
  }
  allowIframeConfig.regexFilters.push(`.*${new URL(url).hostname}.*`)

  // CSP
  const resp = await allowSplitViewCsp(allowIframeConfig)
  await refreshSplitView({ sites: [url] })

  console.log('SplitView csp prepared: ', resp, allowIframeConfig)
}

;(() => {
  setTimeout(() => {
    if (ini_split_view.url) cspAndRefresh(ini_split_view.url)
  }, 900)
})()

watch(
  () => ini_split_view,
  async () => {
    if (ini_split_view.url) {
      cspAndRefresh(ini_split_view.url)
    }
  },
  { deep: true },
)

export function toggleSplitView() {
  ini_split_view.enabled = !ini_split_view.enabled

  saveState(SplitViewStorageKey, ini_split_view)
}

export function setSplitViewAi(ai: string, label: string, url?: string) {
  ini_split_view.enabled = true
  ini_split_view.ai = ai
  ini_split_view.aiLabel = label
  ini_split_view.url = url

  saveState(SplitViewStorageKey, ini_split_view)
}

function typeCheck(data: SplitView | null): CheckResult<SplitView | null> {
  if (!data) {
    return { data: null }
  }
  if (typeof data.enabled !== 'boolean') {
    return {
      error: '属性`ini.split_view.enabled`的值只能为布尔值',
    }
  }
  return {
    data,
  }
}

export function replaceHeader(data: SplitView) {
  const checked = typeCheck(data)
  if (checked.error) {
    throw confirmError(checked.error)
  }
  ini_split_view.enabled = data.enabled
  ini_split_view.ai = data.ai

  saveState(SplitViewStorageKey, ini_split_view)
}
