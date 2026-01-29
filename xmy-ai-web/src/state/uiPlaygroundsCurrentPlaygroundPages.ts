import { ref, watch } from 'vue'
import { useAio, type Aio } from './aios'
import { changeCurrentPlayground, currentPlayground } from './uiPlaygroundsCurrentPlayground'
import { modifyCookie } from '@/action/message'
import { preparedPages } from './uiPlaygroundsPreparedPages'
import { areDev, mobileMode } from './env'
import { tipError } from '@/utils/error'
import { i18n } from './i18n'

const failbackAio: Aio = {
  key: 'baidu',
  name: 'Baidu',
  url: 'https://www.baidu.com/',
  fromChina: false,
  sendMsg: async function () {},
}

export const pro = ref(areDev)
export const currentPlaygroundPages = ref<Aio[]>([])
watch(
  preparedPages,
  async () => {
    if (!currentPlayground.value) {
      if (currentPlaygroundPages.value.length != 0) {
        currentPlaygroundPages.value.length = 0
      }
      return
    }
    const pages = await Promise.all(
      preparedPages.value.map((page) => {
        return useAio(page, (aio) => {
          if (aio) {
            return aio
          }
          return failbackAio
        })
      }),
    )
    currentPlaygroundPages.value = pages
  },
  { immediate: true, deep: true },
)

export function switchAiPage(index: number, key: string) {
  changeCurrentPlayground(async (playground) => {
    const pages = playground.pages
    if (playground.pages.filter((_, i) => i !== index).includes(key)) {
      tipError(i18n.global.t('messages.same-ai-selected'))
      return
    }
    const tokenKeys = await useAio(key, async (aio) => {
      if (aio?.fromChina) {
        let count = 0
        for (let i = 0; i < pages.length; i++) {
          if (i !== index) {
            await useAio(pages[i] || '', (aio) => {
              if (aio?.fromChina) {
                count++
              }
            })
          }
        }
        if (count >= 2 && !pro.value) {
        }
      }

      return aio
        ? [
            {
              url: aio.url,
              cookies: aio.cookies || [],
            },
          ]
        : null
    })
    if (!mobileMode.value) {
      if (tokenKeys) {
        const resp = await modifyCookie(tokenKeys)
        console.log('Ai pages prepared: ', resp, tokenKeys)
      }
    }
    pages[index] = key
  })
}

export function removeAiPage(index: number) {
  changeCurrentPlayground((playground) => {
    playground.pages.splice(index, 1)
  })
}
