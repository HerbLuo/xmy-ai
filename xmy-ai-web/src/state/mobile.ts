import { onMounted, watch } from 'vue'
import { endLessMode, theme } from './ui'
import { ini_ui_header } from './uiHeader'
import { aioHelpers, aios, type Aio } from './aios'
import { currentPlayground } from './uiPlaygroundsCurrentPlayground'

type ReactNativeWindow = {
  ReactNativeWebView: {
    postMessage: (msg: string) => void
  }
}

export function postRnMessage(message: { type: string } & Record<string, unknown>) {
  const rnwv = (window as unknown as ReactNativeWindow).ReactNativeWebView
  if (!rnwv) {
    return
  }
  rnwv.postMessage(JSON.stringify(message))
}

export function mergeState(state: unknown) {
  postRnMessage({
    type: 'MERGE_STATE',
    state,
  })
}

export function defineVariable(varname: string, obj: unknown) {
  postRnMessage({
    type: 'DEFINE_VARIABLE',
    varname,
    varobj: obj,
  })
}

export function initMobile() {
  onMounted(() => {
    watch(
      theme,
      () => {
        mergeState({
          theme: theme.value,
        })
      },
      { immediate: true },
    )

    watch(
      () => ini_ui_header.size,
      () => {
        mergeState({
          headerSize: ini_ui_header.size,
        })
      },
      { immediate: true },
    )

    watch(
      endLessMode,
      () => {
        mergeState({
          smallScreenMode: endLessMode.value,
        })
      },
      { immediate: true },
    )

    watch(
      () => currentPlayground.value?.pages,
      () => {
        mergeState({
          pages: currentPlayground.value?.pages,
        })
      },
      { immediate: true, deep: true },
    )

    watch(
      aios,
      async () => {
        const copied: Record<string, Aio> = {}
        const { moreAios } = await import('./aiosMore')
        const allAios = {
          ...aios,
          ...moreAios(),
        }
        for (const [key, value] of Object.entries(allAios)) {
          const aio = {
            ...value,
          }
          ;(aio as unknown as Record<string, unknown>).sendMsg = `${aio.sendMsg}`
          copied[key] = aio
        }

        mergeState({
          aios: copied,
        })
      },
      { immediate: true, deep: true },
    )

    defineVariable('aioHelpers', aioHelpers)
  })
}
