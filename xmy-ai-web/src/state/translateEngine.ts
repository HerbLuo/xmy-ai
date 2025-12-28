import { loadState, saveState } from '@/utils/storage-persistor'
import { reactive } from 'vue'
import { unwrap, type CheckResult } from './types'
import { aios, delay } from './aios'
import { tipError } from '@/utils/error'
import { allowTransIframeCsp, type AllowIframeConfig } from '@/action/message'

const TranslateEngineStorageKey = 'lambs_translate'

export type TranslateSetting = {
  engine: string
  url: string
}
export const BaiduTrans = 'baidu_trans'
export const BaiduTransUrl = 'https://fanyi.baidu.com/'
const storage = loadState<TranslateSetting>(TranslateEngineStorageKey)
export const translate_setting: TranslateSetting = reactive(
  unwrap(typeCheck(storage)) || {
    engine: BaiduTrans,
    url: BaiduTransUrl,
  },
)

async function csp(url: string) {
  const allowIframeConfig: AllowIframeConfig = {
    regexFilters: [],
  }
  allowIframeConfig.regexFilters.push(`.*${new URL(url).hostname}.*`)

  // CSP
  const resp = await allowTransIframeCsp(allowIframeConfig)
  console.log('Iframes csp prepared: ', resp, allowIframeConfig)
}

async function init() {
  await delay(1000)
  csp(translate_setting.url)
}
init()

export async function switchTranslateEngine(engine: string) {
  const url = engine === BaiduTrans ? BaiduTransUrl : aios[engine]?.url
  if (!url) {
    throw tipError(`当前翻译引擎${engine}不受支持`)
  }
  await csp(url)
  translate_setting.engine = engine
  translate_setting.url = url
  saveState(TranslateEngineStorageKey, translate_setting)
}

function typeCheck(data: TranslateSetting | null): CheckResult<TranslateSetting | null> {
  if (!data) {
    return { data: null }
  }
  if (!data.engine) {
    return {
      error: '属性`ini.translate.engine`必须存在',
    }
  }
  return {
    data: data,
  }
}
