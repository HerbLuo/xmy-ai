import { tipError } from '@/utils/error'
import { aioHelpers, useAio } from '@/state/aios'
import { currentPlayground } from '@/state/uiPlaygroundsCurrentPlayground'
import { currentQuestionOptions } from '@/state/uiPlaygroundsCurrentQuestionOptions'
import { translate } from './translate'
import { log } from '@/state/log'
import { ini_split_view } from '@/state/splitView'
import type { Playground } from '@/state/uiPlaygrounds'
import { executeInSplitView } from './message'
import { ini_ui_language } from '@/state/i18n'

const translateCache: Record<string, Promise<string>> = {}

function sendToModel(
  aiModel: string,
  question: string,
  playground: Playground,
  splitViewMode: boolean,
) {
  useAio(aiModel, async (aio) => {
    if (!aio) {
      throw tipError('aios配置中找不到' + aiModel)
    }
    const { translate: trans } = currentQuestionOptions.value || {}
    if (aio.fromChina === false && trans && ini_ui_language.value !== 'en') {
      if (!translateCache[question]) {
        translateCache[question] = translate(question).then((r) => {
          log.append('翻译结果' + r)
          return r
        })
      }
      question = await translateCache[question]!
    }
    const prefix = playground.prefixs[aio.key]
    const code = `
${aioHelpers}
;(${aio.sendMsg})("${prefix?.replace(/\n/g, '\\n') || ''}${question.replace(/\n/g, '\\n').replace(/`/g, '\\`').replace(/"/g, '\\"')}")
`
    const msg = JSON.stringify({ type: 'exec', code })
    if (splitViewMode) {
      executeInSplitView([
        {
          site: aio.url,
          code,
        },
      ])
    } else {
      const frame = document.querySelector<HTMLIFrameElement>(`#${aiModel} iframe`)
      frame?.contentWindow?.postMessage(msg, new URL(aio.url).origin)
    }
  })
}

export function sendToModels(question: string) {
  const playground = currentPlayground.value
  if (!playground) {
    throw tipError('没有找到当前的Playground，是否界面还未加载好')
  }
  const pages = playground.pages

  for (const page of pages) {
    sendToModel(page, question, playground, false)
  }

  if (ini_split_view.enabled && ini_split_view.ai) {
    sendToModel(ini_split_view.ai, question, playground, true)
  }
}
