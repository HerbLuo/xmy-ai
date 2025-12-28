import { ref, watch } from 'vue'
import { getUiPlaygroundStorageKey, ini_ui_playgrounds, type Playground } from './uiPlaygrounds'
import { currentWorkspace } from './uiWorkspace'
import { currentLayoutSwitching } from './uiLayoutSwitching'
import { saveState } from '@/utils/storage-persistor'
import { aios, useAio, type Aio } from './aios'
import {
  allowIframeCsp,
  modifyCookie,
  type AllowIframeConfig,
  type UrlAndTokenCookieNames,
} from '@/action/message'
import { nextInt } from '@/utils/random'
import { tipError } from '@/utils/error'
import { preparedPages } from './uiPlaygroundsPreparedPages'
import { mobileMode } from './env'
import { ini_ui } from './ui'

export const currentPlayground = ref<Playground>()
watch(
  [currentWorkspace, currentLayoutSwitching, ini_ui],
  () => {
    const smallScreen = ini_ui.layout === 'small_screen'
    const key = smallScreen
      ? 'Infinity'
      : `${currentWorkspace.value.key}:${currentLayoutSwitching.value.key}`
    let playground = ini_ui_playgrounds[key]

    if (playground) {
      // 已有playground
      currentPlayground.value = playground
      return
    }
    // virtual
    let times = -1
    for (const pg of Object.values(ini_ui_playgrounds)) {
      if (pg.times > times) {
        times = pg.times
        // 从访问最多的布局中复制
        playground = JSON.parse(JSON.stringify(pg))
        if (playground) {
          playground.times = 0
        }
      }
    }
    const lsCount = smallScreen ? 3 : currentLayoutSwitching.value.count
    if (playground) {
      // 从访问最多的布局中复制
      // 须要补足布局的个数
      if (playground.pages.length < lsCount) {
        const pages = nextPagesFromAio(lsCount - playground.pages.length, aios, playground.pages)
        playground.pages = [...playground.pages, ...pages]
      }
      if (!smallScreen) {
        // 需删除多余的布局
        if (playground.pages.length > lsCount) {
          playground.pages.length = lsCount
        }
      }
      ini_ui_playgrounds[key] = playground
    } else {
      playground = createDefaultPlayground(lsCount, aios)
      ini_ui_playgrounds[key] = playground
    }
    saveState(getUiPlaygroundStorageKey(key), playground)
    currentPlayground.value = playground
  },
  { deep: true, immediate: true },
)

function nextPagesFromAio(count: number, aios: Record<string, Aio>, excludes?: string[]): string[] {
  const aioKeys = Object.keys(aios)
  const excludeIndexs = excludes?.map((e) => aioKeys.indexOf(e) + 1)
  let indexs = nextInt(aioKeys.length - 1, count, excludeIndexs)
  if (typeof indexs === 'number') {
    indexs = [indexs]
  }
  const pages = indexs.map((i) => {
    const key = aioKeys[i - 1]
    if (!key) {
      console.warn('NEVER', aios, i)
      return 'NEVER'
    }
    return key
  })
  return pages
}

function createDefaultPlayground(aiPageCount: number, aios: Record<string, Aio>): Playground {
  return {
    questionOptions: { all: true, network: false, deep: false, translate: true },
    pages:
      aiPageCount === 3 && mobileMode
        ? ['tongyi', 'deepseek', 'doubao']
        : nextPagesFromAio(aiPageCount, aios),
    prefixs: {},
    times: 0,
  }
}

// 通过插件调整目标网站策略，使其可操控
watch(
  () => [currentPlayground.value?.pages, mobileMode.value],
  async () => {
    const pages = currentPlayground.value?.pages
    if (!pages) {
      return
    }
    if (mobileMode.value) {
      preparedPages.value = [...pages]
      return
    }
    console.log('pages changed', currentPlayground.value?.pages)

    const allowIframeConfig: AllowIframeConfig = {
      regexFilters: [],
    }
    const urlAndTokenCookieNames: UrlAndTokenCookieNames[] = []
    await Promise.all(
      pages.map((page) =>
        useAio(page, (aio) => {
          if (!aio) {
            return
          }
          const url = aio?.url || ''
          allowIframeConfig.regexFilters.push(`.*${new URL(url).hostname}.*`)
          const cookies = aio?.cookies || []
          if (cookies.length) {
            urlAndTokenCookieNames.push({
              url,
              cookies,
            })
          }
          if (aio?.extraCsp) {
            for (const csp of aio.extraCsp) {
              allowIframeConfig.regexFilters.push(`.*${new URL(csp).hostname}.*`)
            }
          }
        }),
      ),
    )

    // CSP
    let resp = await allowIframeCsp(allowIframeConfig)
    console.log('Iframes csp prepared: ', resp, allowIframeConfig)

    // Cookie
    if (urlAndTokenCookieNames.length) {
      resp = await modifyCookie(urlAndTokenCookieNames)
      console.log("Ai pages' cookie prepared: ", resp, urlAndTokenCookieNames)
    }

    if (currentPlayground.value) {
      preparedPages.value = [...pages]
    }
  },
  { deep: true, immediate: true },
)

export function changeCurrentPlayground(callback: (playground: Playground) => unknown) {
  const smallScreen = ini_ui.layout === 'small_screen'

  const key = smallScreen
    ? 'Infinity'
    : `${currentWorkspace.value.key}:${currentLayoutSwitching.value.key}`
  if (!currentPlayground.value) {
    throw tipError('找不到当前激活的playground')
  }

  ini_ui_playgrounds[key] = currentPlayground.value

  const playground = currentPlayground.value
  Promise.resolve(callback(playground)).then(() => {
    saveState(getUiPlaygroundStorageKey(key), playground)
  })
}

export function changeAiPrefix(aiKey: string, prefix: string) {
  changeCurrentPlayground(async (playground) => {
    playground.prefixs[aiKey] = prefix
  })
}
