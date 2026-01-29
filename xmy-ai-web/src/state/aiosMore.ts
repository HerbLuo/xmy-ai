import { checkLogin, delay, emitEnter, findEl, sendMsg, setValue, type Aio } from './aios'
import { i18n } from './i18n'

export function moreAios(): Record<string, Aio> {
  return {
    copilot: {
      key: 'copilot',
      name: 'Copilot',
      tested: 20260129,
      onlySplitViewMode: true,
      url: 'https://copilot.microsoft.com/',
      fromChina: false,
      sendMsg: async (msg) => {
        const el = await findEl<HTMLTextAreaElement>('#userInput')
        setValue(el, msg)
        await delay(500)
        el.focus()
        emitEnter(el)
      },
    },
    copilot_github: {
      key: 'copilot_github',
      name: 'CopilotGH',
      tested: 20251217,
      tags: [],
      cookies: ['*'],
      url: 'https://github.com/copilot',
      sendMsg: (msg) => sendMsg('#copilot-chat-textarea', msg),
    },
    felo: {
      key: 'felo',
      name: 'Felo',
      tested: 20260129,
      tags: [i18n.global.t('FNL'), i18n.global.t('Japan')],
      url: 'https://felo.ai/search',
      fromChina: false,
      sendMsg: (msg) => sendMsg('textarea.w-full', msg),
    },
    genspark: {
      key: 'genspark',
      name: 'Genspark',
      tags: [],
      tested: 20260129,
      cookies: ['*'],
      url: 'https://www.genspark.ai/',
      sendMsg: (msg) => sendMsg('.search-input', msg),
    },
    kimi: {
      key: 'kimi',
      name: 'Kimi',
      tags: [i18n.global.t('China'), 'Free'],
      tested: 20260129,
      url: 'https://www.kimi.com/',
      fromChina: true,
      storage: ['access_token', 'refresh_token'],
      onLoad: function () {
        checkLogin(
          () => {
            const usernameEl = document.querySelector('.user-name')
            return usernameEl && usernameEl.innerHTML === '登录'
          },
          'Kimi',
          'font-size: 22px;color: #ff6680; font-weight: blod;',
        )
      },
      sendMsg: async function (msg) {
        const el = await findEl('.chat-input-editor')
        const input = new InputEvent('beforeinput', {
          inputType: 'insertText',
          data: msg,
          bubbles: true,
          cancelable: true,
        })
        el.dispatchEvent(input)
        await delay(100)
        const btn = await findEl<HTMLButtonElement>('.send-button-container')
        btn.click()
      },
    },
    liner: {
      key: 'liner',
      name: 'Liner',
      tags: [i18n.global.t('FNL')],
      onlySplitViewMode: true,
      cookies: ['*'],
      url: 'https://app.liner.com/',
      sendMsg: async function (msg) {
        const el = await findEl('.ql-editor')
        el.innerHTML = `<p>${msg}</p>`
        await delay(200)
        emitEnter(el)
      },
    },
    mistral: {
      key: 'mistral',
      name: 'Mistral',
      tags: [i18n.global.t('FNL')],
      cookies: ['*'],
      fromChina: false,
      tested: 20260129,
      url: 'https://chat.mistral.ai/chat',
      sendMsg: (msg) => sendMsg('div[contenteditable]', msg),
    },
    perplexity: {
      key: 'perplexity',
      name: 'Perplexity',
      tags: [i18n.global.t('FNL')],
      tested: 20260129,
      onlySplitViewMode: true,
      url: 'https://www.perplexity.ai/',
      fromChina: false,
      sendMsg: (msg) => sendMsg('#ask-input', msg),
    },
    poe: {
      key: 'poe',
      name: 'Poe',
      tested: 20260129,
      tags: [i18n.global.t('tags.limited-free'), i18n.global.t('tags.multi-ai')],
      url: 'https://poe.com/',
      sendMsg: (msg) => sendMsg('textarea', msg),
    },
    you: {
      key: 'you',
      name: 'You.com',
      tags: [i18n.global.t('FNL')],
      cookies: ['*'],
      tested: 20260129,
      url: 'https://you.com/?chatMode=default',
      fromChina: false,
      sendMsg: (msg) => sendMsg('#search-input-textarea', msg),
    },
    zai: {
      key: 'zai',
      name: 'Zai',
      onlySplitViewMode: true,
      tags: [i18n.global.t('FNL')],
      cookies: ['*'],
      storage: ['token'],
      fromChina: false,
      tested: 20260129,
      onLoad: function () {
        checkLogin(() => !!document.querySelector('button.h-8'), 'Zai', '', true)
      },
      url: 'https://chat.z.ai/',
      sendMsg: (msg) => sendMsg('#chat-input', msg),
    },

    YiYan: {
      key: 'YiYan',
      name: '文心一言',
      tags: ['Free', i18n.global.t('China')],
      tested: 20260129,
      fromChina: true,
      url: 'https://yiyan.baidu.com/',
      sendMsg: (msg) => sendMsg('div[role="textbox"]', msg),
    },
    SenseChat: {
      key: 'SenseChat',
      name: '商量',
      tags: ['Free', i18n.global.t('China')],
      storage: ['accessToken', 'refreshToken'],
      fromChina: true,
      tested: 20251217,
      onLoad: function () {
        checkLogin(
          () => !!document.querySelector('textarea[placeholder="点击登录，开启与商量的畅聊"]'),
          '商量',
          'font-size: 16px',
        )
      },
      url: 'https://chat.sensetime.com/',
      sendMsg: (msg) => sendMsg('textarea.ant-input', msg),
    },
    NaMi: {
      key: 'NaMi',
      name: '纳米',
      tags: ['Free', i18n.global.t('China')],
      tested: 20260129,
      url: 'https://bot.n.cn/',
      fromChina: true,
      sendMsg: (msg) => sendMsg('div[role="textbox"]', msg),
    },
    BaiChuan: {
      key: 'BaiChuan',
      name: '百小应',
      tags: ['Free', i18n.global.t('tags.medical'), i18n.global.t('China')],
      cookies: ['*'],
      tested: 20260129,
      fromChina: true,
      url: 'https://ying.baichuan-ai.com/chat',
      sendMsg: (msg) => sendMsg('textarea.cursor-text', msg),
    },
    HaiLuo: {
      key: 'HaiLuo',
      name: '海螺',
      tags: ['Free', i18n.global.t('China')],
      onlySplitViewMode: true,
      tested: 20260129,
      fromChina: true,
      url: 'https://agent.minimaxi.com/',
      sendMsg: (msg) => sendMsg('#chat-input', msg),
    },
    TianGong: {
      key: 'TianGong',
      name: '天工',
      tags: ['Free', i18n.global.t('China')],
      tested: 20260129,
      fromChina: true,
      url: 'https://www.tiangong.cn/',
      sendMsg: (msg) => sendMsg('div[contenteditable]', msg),
    },
    YueWen: {
      key: 'YueWen',
      name: '阶跃',
      tags: ['Free', i18n.global.t('China')],
      url: 'https://www.stepfun.com/',
      cookies: ['*'],
      fromChina: true,
      tested: 20251217,
      sendMsg: async function (msg) {
        const el = await findEl('.w-full textarea:not(.w-full)')
        setValue(el, msg)
        delay(500)
        const btn = await findEl<HTMLDivElement>('button.w-8.h-8', undefined, (btn) => {
          return btn.classList.contains('[&_svg]:size-5')
        })
        btn.click()
      },
    },
    MetaSo: {
      key: 'MetaSo',
      name: '秘塔',
      tags: ['Free', i18n.global.t('China')],
      tested: 20260129,
      fromChina: true,
      url: 'https://metaso.cn/',
      sendMsg: (msg) => sendMsg('.search-consult-textarea', msg),
    },
    zhipu: {
      key: 'zhipu',
      name: '智谱清言',
      tags: [i18n.global.t('FNL'), i18n.global.t('China')],
      tested: 20260129,
      url: 'https://chatglm.cn/',
      fromChina: true,
      sendMsg: async function (msg) {
        const el = await findEl('textarea')
        setValue(el, msg)
        emitEnter(el)
      },
    },
  }
}
