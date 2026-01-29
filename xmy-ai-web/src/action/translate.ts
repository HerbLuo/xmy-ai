import { aios, delay, emitEnter, findEl, sendMsg, setValue } from '@/state/aios'
import { BaiduTrans, BaiduTransUrl, translate_setting } from '@/state/translateEngine'
import { confirmError, tipError } from '@/utils/error'
import { appendExecutorToIframe } from './message'
import { log } from '@/state/log'

async function reload(frame: HTMLIFrameElement) {
  frame.src = frame.src
  await Promise.race([
    new Promise((res) => {
      frame.onload = res
    }),
    delay(10000).then(() => Promise.reject('加载超时')),
  ])
  await appendExecutorToIframe()
}

async function translateByBaidu(src: string, frame: HTMLIFrameElement) {
  return rpcAndReload(
    frame,
    BaiduTransUrl,
    async function (src) {
      const el = await findEl<HTMLDivElement>('#editor-text div[role=textbox]')
      const input = new InputEvent('beforeinput', {
        inputType: 'insertText',
        data: src as string,
        bubbles: true,
        cancelable: true,
      })
      el.dispatchEvent(input)
      emitEnter(el)
      const resEl = await findEl<HTMLDivElement>('#trans-selection', 10)
      let remainder_times = 50
      while (remainder_times > 0) {
        if (resEl.innerText) {
          break
        }
        remainder_times--
        await delay(200)
      }

      await delay(200)
      return resEl.innerText
    },
    [src],
    20000,
  )
}

export async function translate(src: string): Promise<string> {
  const engine = translate_setting.engine
  log.append('翻译中，翻译引擎' + engine)
  const frame = document.querySelector<HTMLIFrameElement>(`#trans_engine`)
  if (!frame) {
    throw tipError('找不到翻译所在DOM对象')
  }

  if (engine === BaiduTrans) {
    return translateByBaidu(src, frame)
  } else {
    const aio = aios[translate_setting.engine]
    if (!aio) {
      confirmError(
        '翻译工作找不到当前的AI智能体' + translate_setting.engine + '，回退到了百度翻译。',
      )
      return translateByBaidu(src, frame)
    } else if (!aio.trans) {
      confirmError('当前AI模型' + aio.name + '不支持自动翻译，回退到了百度翻译。')
      return translateByBaidu(src, frame)
    }
    return rpcAndReload(
      frame,
      aio.url,
      aio.trans as unknown as (...args: unknown[]) => Promise<string>,
      [src],
      20000,
    )
  }
}

async function rpcAndReload<T>(
  frame: HTMLIFrameElement,
  url: string,
  func: (...args: unknown[]) => Promise<T>,
  args: unknown[],
  timeout = 5000,
): Promise<T> {
  const promise = new Promise<T>((res, rej) => {
    const timer = setTimeout(() => {
      rej('timeout')
    }, timeout)

    window.addEventListener('message', (event) => {
      if (event.data.type === 'Xmy_RPC_Response') {
        clearTimeout(timer)
        res(event.data.res)
      }
    })
  })

  const origin = new URL(window.location.href).origin

  const code = `
${delay.toString().replace(/\s+/g, ' ')}
${findEl.toString().replace(/\s+/g, ' ')}
${setValue.toString().replace(/\s+/g, ' ')}
${emitEnter.toString().replace(/\s+/g, ' ')}
${sendMsg.toString().replace(/\s+/g, ' ')}
if (!window.location.search.includes('trans=true') && !window._xmy_trans) {
  return
}
const res = await (${func})(...${JSON.stringify(args)});
window.parent.postMessage({type: 'Xmy_RPC_Response', res}, '${origin}')`
  frame.contentWindow?.postMessage(JSON.stringify({ type: 'exec', code }), new URL(url).origin)
  const result = await promise
  await reload(frame)
  appendLbTransFlag(frame)
  return result
}

export function appendLbTransFlag(frame: HTMLIFrameElement) {
  const code = `window._xmy_trans = true`
  frame.contentWindow?.postMessage(
    JSON.stringify({ type: 'exec', code }),
    new URL(translate_setting.url).origin,
  )
}
