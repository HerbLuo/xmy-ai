import { loadState, saveState } from '@/utils/storage-persistor'
import { computed, ref, watch } from 'vue'
import { createI18n } from 'vue-i18n'

export const LanguageMap = {
  简体中文: 'zh-CN', // Mandarin Chinese
  English: 'en', // 英语
  繁體中文: 'zh-TW', // Traditional Chinese
  // Русский: 'ru-RU', // 俄语 Russian
  // Português: 'pt-BR', // 葡萄牙语 Portuguese
  // 한국어: 'ko', // 韩语 Korean
  日本語: 'ja-JP', // 日语 Japanese
  // हिन्दी: 'hi-IN', // 印地语 Hindi
  // Français: 'fr-FR', // 法语 French
  // Español: 'es-ES', // 西班牙语 Spanish
  // Deutsch: 'de-DE', // 德语 German
}

const UiLanguageStorageKey = 'lambs_ini_ui_language'
const CacheKey = 'LOCALE_CACHE_'
const supportedLocales = Object.values(LanguageMap)

const storage = loadState<string>(UiLanguageStorageKey)
const urlLocale = location.hostname === 'xmy-ai.cn' ? 'zh-CN' : 'en'
const defaultLocale = storage || urlLocale
const messagesStr = localStorage.getItem(`${CacheKey}${defaultLocale}`)

export const ini_ui_language = ref(detectLocale())

export const isCn = computed(() => ini_ui_language.value === 'zh-CN')

export function switchLanguage(lang: string) {
  ini_ui_language.value = lang

  saveState(UiLanguageStorageKey, lang)
}

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
  for (const supportedLocale of supportedLocales) {
    if (browserLang.startsWith(supportedLocale)) {
      return supportedLocale;
    }
  }
  if (browserLang.startsWith('en')) {
    return 'en'
  }
  return 'en'
}

export const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: urlLocale,
  messages: messagesStr ? { 
    [defaultLocale]: JSON.parse(messagesStr)
  } : undefined,
})

async function loadAndSetLocale(locale: string) {
  const { default: messages } = await import(`../locales/${locale}.json`)
  localStorage.setItem(`${CacheKey}${locale}`, JSON.stringify(messages))
  i18n.global.setLocaleMessage(locale, messages)
  i18n.global.locale = locale
  document.querySelector('html')?.setAttribute('lang', locale)
}

watch(
  ini_ui_language,
  async (lang) => {
    await loadAndSetLocale(lang)
    const title = i18n.global.t('header.title')
    localStorage.setItem('LbTitle', title)
    document.title = title
  },
  { immediate: true },
)
