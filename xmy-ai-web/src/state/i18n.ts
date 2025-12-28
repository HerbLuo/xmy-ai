import { loadState, saveState } from '@/utils/storage-persistor'
import { ref, watch } from 'vue'
import { createI18n } from 'vue-i18n'

export const LanguageMap = {
  简体中文: 'zh-CN', // Mandarin Chinese
  English: 'en', // 英语
  繁體中文: 'zh-TW', // Traditional Chinese
  Русский: 'ru-RU', // 俄语 Russian
  Português: 'pt-BR', // 葡萄牙语 Portuguese
  한국어: 'ko-KR', // 韩语 Korean
  日本語: 'ja-JP', // 日语 Japanese
  हिन्दी: 'hi-IN', // 印地语 Hindi
  Français: 'fr-FR', // 法语 French
  Español: 'es-ES', // 西班牙语 Spanish
  Deutsch: 'de-DE', // 德语 German
}

const UiLanguageStorageKey = 'lambs_ini_ui_language'
const CacheKey = 'LOCALE_CACHE_'
const supportedLocales = Object.values(LanguageMap)

const storage = loadState<string>(UiLanguageStorageKey)
const urlLocale = location.hostname === 'xmy-ai.cn' ? 'zh-CN' : 'en'
const defaultLocale = storage || urlLocale
const messagesStr = localStorage.getItem(`${CacheKey}${defaultLocale}`)

export const ini_ui_language = ref(detectLocale())

export function switchLanguage(lang: string) {
  ini_ui_language.value = lang

  saveState(UiLanguageStorageKey, lang)
}

watch(
  ini_ui_language,
  (lang) => {
    loadAndSetLocale(lang)
  },
  { immediate: true },
)

function detectLocale() {
  // Read from configuration first, then the domain name, then detect
  if (storage) {
    return storage
  }
  if (urlLocale === 'zh-CN') {
    return urlLocale
  }
  const browserLang = navigator.language || 'en'
  if (browserLang === 'zh') {
    return 'zh-CN'
  } 
  if (supportedLocales.includes(browserLang)) {
    return browserLang
  }
  if (browserLang.startsWith("en")) {
    return 'en'
  }
  return 'en'
}

export const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: urlLocale,
  messages: messagesStr ? {[defaultLocale]: JSON.parse(messagesStr)} : undefined,
})

async function loadAndSetLocale(locale: string) {
  const { default: messages } = await import(`../locales/${locale}.json`)
  localStorage.setItem(`${CacheKey}${locale}`, JSON.stringify(messages))
  i18n.global.setLocaleMessage(locale, messages)
  i18n.global.locale = locale
  document.querySelector('html')?.setAttribute('lang', locale)
}
