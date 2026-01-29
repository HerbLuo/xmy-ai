import { loadState, saveState } from '@/utils/storage-persistor'
import { unwrap, type CheckResult } from './types'
import { confirmError } from '@/utils/error'
import { reactive } from 'vue'
import { i18n, ini_ui_language } from './i18n'

const StorageKey = 'lambs_ini_aios'

export interface Aio {
  key: string
  name: string
  url: string
  tested?: number
  pcUA?: boolean
  tags?: string[]
  cookies?: string[] // Token
  storage?: string[] // Token
  extraCsp?: string[] // 额外须要添加CSP的网址
  onlySplitViewMode?: boolean
  fromChina?: boolean
  onLoad?: () => void
  sendMsg: (msg: string, options: { mobile: boolean }) => Promise<void>
  trans?: (src: string) => Promise<string>
  unstableTrans?: boolean
}

/* aio helpers */
export function delay(time: number) {
  return new Promise((res) => setTimeout(res, time))
}

export async function findEl<E extends Element>(
  str: string,
  timeout: number = 5,
  filter?: (el: Element) => boolean | Promise<boolean>,
  nullable = false,
): Promise<E> {
  const els = document.querySelectorAll(str)
  if (els.length === 1) {
    return els[0] as E
  } else if (els.length > 1 && filter) {
    for (const el of els) {
      if (await filter(el)) {
        return el as E
      }
    }
  }

  if (timeout < 0 && !nullable) {
    const errorMsg = '找不到' + str + '，刷新重试或尝试通过修改配置解决'
    alert(errorMsg)
    throw new Error(errorMsg)
  }
  await new Promise((res) => setTimeout(res, 500))
  return findEl(str, timeout - 0.5, filter, nullable)
}

export function setValue(_el: Element, val: string, type?: 'paste' | 'input') {
  const el = _el as unknown as Record<string, unknown> & HTMLElement

  if (!type) {
    if (el.tagName === 'DIV' && el.getAttribute('contenteditable') === 'true') {
      type = 'paste'
    } else {
      type = 'input'
    }
  }

  el.focus()

  if (type === 'paste') {
    const transfer = new DataTransfer()
    transfer.setData('text/plain', val)
    const event = new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true })
    el.dispatchEvent(event)
  } else {
    const valueSetter = Object.getOwnPropertyDescriptor(el.__proto__, 'value')?.set
    if (valueSetter) {
      valueSetter.call(el, val)
    } else {
      el.value = val
    }
    for (const e of ['input', 'change']) {
      const event = new Event(e, { bubbles: true, cancelable: true })
      el.dispatchEvent(event)
    }
  }
}

export function emitEnter(el: Element) {
  ;(el as HTMLElement).focus()
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
  })
  el.dispatchEvent(event)
}

export async function sendMsg(selector: string, msg: string, type?: 'paste' | 'input') {
  const el = await findEl<HTMLDivElement | HTMLTextAreaElement>(selector)
  setValue(el, msg, type)
  await delay(200)
  emitEnter(el)
}

export function checkLogin(
  test: () => unknown,
  sitename: string,
  style: string,
  aMode: boolean = false,
) {
  let times = 0
  const timer = setInterval(() => {
    if (times > 2 * 60 * 3) {
      clearInterval(timer)
    }
    times++
    if (test()) {
      const div = document.createElement('div')
      const i18n = window._xmy_i18n_aios
      div.innerHTML = `
<h2 style="line-height: 2em;">
  ${aMode ? i18n.check_login_no_login : i18n.check_login_require}
  <ul>
    <li>${i18n.check_login_step1}</li>
    <li>${i18n.t(i18n.check_login_step2, { sitename })}</li>
    <li>${i18n.t(i18n.check_login_step3, { sitename })}</li>
    <li>${i18n.check_login_step4}</li>
  </ul>
</h1>`
      div.style = `
position: fixed;
z-index: 99999999;
left: ${aMode ? '50%' : 0};
right: 0;
top: 0;
bottom: ${aMode ? '70%' : 0};
background: #fffe;
display: flex;
justify-content: center;
align-items: center;
backdrop-filter: blur(2px);
${style}`
      document.body.appendChild(div)

      if (aMode) {
        setTimeout(() => {
          document.body.removeChild(div)
        }, 8000)
      }
      clearInterval(timer)
    }
  }, 500)
}

export const aioHelpers = `
  ${delay.toString().replace(/\s+/g, ' ')}
  ${findEl.toString().replace(/\s+/g, ' ')}
  ${setValue.toString().replace(/\s+/g, ' ')}
  ${emitEnter.toString().replace(/\s+/g, ' ')}
  ${sendMsg.toString().replace(/\s+/g, ' ')}
`
const onLoadHelpers = `${checkLogin}`

const aiosPlain: Record<string, Aio> = {
  deepseek: {
    key: 'deepseek',
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com/',
    tested: 20260129,
    pcUA: true,
    tags: ['Free'],
    fromChina: true,
    cookies: ['*'],
    storage: ['userToken'],
    onLoad: function () {
      checkLogin(
        () =>
          !!document.querySelector('.ds-sign-up-form__main') ||
          !!document.querySelector('.ds-auth-form-wrapper'),
        'DeepSeek',
        '',
      )
    },
    sendMsg: (msg) => sendMsg('textarea', msg),
    trans: async function (src) {
      const el = await findEl<HTMLDivElement | HTMLTextAreaElement>('textarea')
      setValue(el, `将以下文字翻译为英文\n${src}`)
      await delay(200)
      emitEnter(el)
      await delay(5000)
      const question_el = await findEl<HTMLDivElement>('.ds-message > div', 5, (el) => {
        if (el.innerHTML.includes('将以下文字翻译为英文')) {
          return true
        }
        return false
      })
      const result_box = question_el.closest('.ds-scroll-area > div')
      if (!result_box) {
        return ''
      }
      const result_el = result_box.childNodes[result_box.childNodes.length - 1]
      return (result_el as HTMLDivElement)?.innerText
    },
    unstableTrans: true,
  },
  yuanbao: {
    key: 'yuanbao',
    name: '元宝',
    tested: 20260129,
    tags: ['Free'],
    url: 'https://yuanbao.tencent.com/',
    fromChina: true,
    sendMsg: (msg) => sendMsg('.ql-editor', msg),
    trans: async function (src) {
      const msg = `将以下文字翻译为英文，直接给出结果，不要多余的解释\n${src}`
      await sendMsg('.ql-editor', msg)

      let times = 0
      while (times < 30) {
        const loading = document.querySelector('.hyc-content-loading')
        if (!loading) {
          const res = document.querySelector<HTMLDivElement>('.hyc-content-md-done')
          if (res) {
            return res.innerText
          }
        }
        times++
        await delay(1000)
      }
      return ''
    },
  },
  tongyi: {
    key: 'tongyi',
    name: '千问',
    tested: 20260129,
    tags: ['Free', 'Java'],
    extraCsp: ['https://www.tongyi.com/'],
    url: 'https://www.qianwen.com/',
    cookies: ['tongyi_sso_ticket'],
    fromChina: true,
    sendMsg: (msg) => sendMsg('textarea.ant-input', msg),
  },
  doubao: {
    key: 'doubao',
    name: '豆包',
    tested: 20260129,
    tags: ['Free'],
    url: 'https://www.doubao.com/',
    fromChina: true,
    sendMsg: (msg) => sendMsg('textarea.semi-input-textarea', msg),
    trans: async function (src) {
      const msg = `将以下文字翻译为英文，直接给出结果，不要多余的解释\n${src}`
      await sendMsg('textarea.semi-input-textarea', msg)

      let times = 0
      while (times < 30) {
        const loading = document.querySelector('[data-testid="message_loading"]')
        const indicator = document.querySelector('span[data-testid="indicator"]')
        if (!loading && !indicator) {
          console.log('--------------DouBao Trans--------------')
          console.log(
            document.querySelector<HTMLDivElement>('div[data-testid="receive_message"]')?.innerHTML,
          )
          const box = document.querySelector<HTMLDivElement>(
            'div[data-testid="receive_message"] div[data-testid="message_text_content"]',
          )
          if (box) {
            return box.innerText
          }
        }

        times++
        await delay(1000)
      }
      return ''
    },
    unstableTrans: true,
  },

  gemini: {
    key: 'gemini',
    name: 'Gemini',
    tested: 20260129,
    url: 'https://gemini.google.com/app',
    fromChina: false,
    sendMsg: async function (msg) {
      const el = await findEl('.ql-editor')
      el.innerHTML = `<p>${msg}</p>`
      await delay(200)
      emitEnter(el)
    },
  },
  chatgpt: {
    key: 'chatgpt',
    name: 'ChatGPT',
    tested: 20260129,
    url: 'https://chatgpt.com/',
    fromChina: false,
    cookies: ['*'],
    sendMsg: (msg) => sendMsg('#prompt-textarea', msg),
  },
  claude: {
    key: 'claude',
    name: 'Claude',
    tags: ['Dev'],
    tested: 20260129,
    cookies: ['*'],
    url: 'https://claude.ai/',
    fromChina: false,
    sendMsg: async function (msg) {
      const el = await findEl('div[contenteditable=true]')
      el.innerHTML = `<p>${msg}</p>`
      delay(0)
      const btn = await findEl<HTMLDivElement>('button[aria-label="Send message"]')
      btn.click()
    },
  },
  grok: {
    key: 'grok',
    name: 'Grok',
    tags: ['Free', 'Musk'],
    tested: 20251217,
    url: 'https://grok.com/',
    extraCsp: ['https://accounts.x.ai', 'https://accounts.google.com'],
    fromChina: false,
    cookies: ['*'],
    onLoad: function () {
      const KEY = 'XMY_TIPPED'
      if (!localStorage.getItem(KEY)) {
        alert(window._xmy_i18n_aios.grok_on_load)
        localStorage.setItem(KEY, 'true')
      }
    },
    sendMsg: async function (msg) {
      const el = await Promise.race([
        findEl<HTMLDivElement>('.ProseMirror', 5, undefined, true),
        findEl<HTMLTextAreaElement>('textarea.w-full', 5, undefined, true),
      ])
      if (!el) {
        alert("Can't found input in Grok")
        throw new Error("Can't found input in Grok")
      }
      if (el.nodeName === 'TEXTAREA') {
        setValue(el, msg)
      } else {
        el.innerHTML = `<p>${msg}</p>`
      }
      await delay(100)
      emitEnter(el)
    },
  },
}

/* aio helpers end */
const storage = loadState<Record<string, Aio>>(StorageKey)
export const aios: Record<string, Aio> = reactive(unwrap(typeCheck(storage)) || aiosPlain)

/* actions */
export async function useAio<R>(page: string, callback: (aio: Aio | null) => R): Promise<R> {
  let aio = aios[page]
  if (aio) {
    return callback(aio)
  }
  const { moreAios } = await import('./aiosMore')
  aio = moreAios()[page]
  if (aio) {
    return callback(aio)
  }
  return callback(null)
}
/* actions end */

export function forceMergeAios(aios: Record<string, Aio>) {
  const aioMap = Object.values(aiosPlain).reduce(
    (sum, it) => {
      const key = new URL(it.url).host
      sum[key] = it
      return sum
    },
    {} as Record<string, Aio>,
  )

  for (const aio of Object.values(aios)) {
    const host = new URL(aio.url).host
    const cfgInCode = aioMap[host]
    if (cfgInCode) {
      aio.fromChina = cfgInCode.fromChina
    }
  }
}

function typeCheck(aios: Record<string, Aio> | null): CheckResult<Record<string, Aio> | null> {
  if (!aios) {
    return { data: null }
  }
  for (const [key, aio] of Object.entries(aios)) {
    if (key !== aio.key) {
      return { error: i18n.global.t('typecheck.aios-key', { aioName: aio.name, aioKey: key }) }
    }
    if (!aio.name) {
      return { error: i18n.global.t('typecheck.aios-name') }
    }
    if (!aio.url) {
      return { error: i18n.global.t('typecheck.aios-url') }
    }
    if (aio.cookies && !(aio.cookies instanceof Array)) {
      return { error: i18n.global.t('typecheck.aios-cookies') }
    }
    if (aio.storage && !(aio.storage instanceof Array)) {
      return { error: i18n.global.t('typecheck.aios-storage') }
    }
    if (aio.extraCsp && !(aio.extraCsp instanceof Array)) {
      return { error: i18n.global.t('typecheck.aios-extraCsp') }
    }
    if (![undefined, null, true, false].includes(aio.fromChina)) {
      return { error: i18n.global.t('typecheck.aios-fromChina') }
    }
    if (typeof aio.sendMsg !== 'function') {
      return { error: i18n.global.t('typecheck.aios-sendMsg') }
    }
    if (aio.onLoad && typeof aio.onLoad !== 'function') {
      return { error: i18n.global.t('typecheck.aios-onLoad') }
    }
    if (aio.trans && typeof aio.trans !== 'function') {
      return { error: i18n.global.t('typecheck.aios-trans') }
    }
  }
  forceMergeAios(aios)
  return {
    data: aios,
  }
}

export function replaceAio(aio: Aio) {
  const checked = typeCheck({
    [aio.key]: aio,
  })
  if (checked.error) {
    throw confirmError(checked.error.replace('aios.', ''))
  }
  aios[aio.key] = aio
  saveState(StorageKey, aios)
}

export function addAioToAios(aio: Aio) {
  replaceAio(aio)
}

export function removeAio(key: string) {
  delete aios[key]
  saveState(StorageKey, aios)
}

export function replaceAios(data: Record<string, Aio>) {
  const checked = typeCheck(data)
  if (checked.error) {
    throw confirmError(checked.error)
  }
  for (const key of Object.keys(aios)) {
    delete aios[key]
  }
  for (const [key, value] of Object.entries(data)) {
    aios[key] = value
  }
  saveState(StorageKey, aios)
}

function appendI18nVarsToIframe(fm: HTMLIFrameElement) {
  const code = `
window._xmy_i18n_aios = (window._xmy_i18n_aios || {});
_xmy_i18n_aios.t = (msg = '', obj) => {for (const [k, v] of Object.entries(obj)) { msg = msg.replaceAll('{' + k + '}', v) } return msg;}
_xmy_i18n_aios.locale = '${ini_ui_language.value}'
_xmy_i18n_aios.check_login_require = '${i18n.global.t('check-login.require').replace("'", "\\'")}'
_xmy_i18n_aios.check_login_no_login = '${i18n.global.t('check-login.no_login').replace("'", "\\'")}'
_xmy_i18n_aios.check_login_step1 = '${i18n.global.t('check-login.step1').replace("'", "\\'")}'
_xmy_i18n_aios.check_login_step2 = '${i18n.global.t('check-login.step2').replace("'", "\\'")}'
_xmy_i18n_aios.check_login_step3 = '${i18n.global.t('check-login.step3').replace("'", "\\'")}'
_xmy_i18n_aios.check_login_step4 = '${i18n.global.t('check-login.step4').replace("'", "\\'")}'
_xmy_i18n_aios.grok_on_load = '${i18n.global.t('grok-on-load').replace("'", "\\'")}'
`
  fm?.contentWindow?.postMessage(JSON.stringify({ type: 'exec', code }), fm.src)
}

export function onLoadScript(aioKey: string, url: string, script: () => unknown) {
  const fm = document.querySelector<HTMLIFrameElement>(`#${aioKey} iframe`)
  if (!fm) {
    return
  }
  appendI18nVarsToIframe(fm)
  setTimeout(() => {
    const code = `${onLoadHelpers};(\n${script.toString()})()`
    fm.contentWindow?.postMessage(JSON.stringify({ type: 'exec', code }), url)
  })
}
