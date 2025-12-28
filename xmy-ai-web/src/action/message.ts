export interface UrlAndTokenCookieNames {
  url: string
  cookies: string[]
}

export interface HostnameAndTokenLocalStorageNames {
  hostname: string
  storage: string[]
}

export interface AllowIframeConfig {
  regexFilters: string[]
  all?: boolean
}

export interface ExecuteInSplitView {
  site: string
  code: string
}

export interface RefreshSplitView {
  sites: string[]
}

export function copyStorage(uts: HostnameAndTokenLocalStorageNames[]) {
  const map = uts.reduce(
    (sum, it) => {
      sum[it.hostname] = it.storage
      return sum
    },
    {} as Record<string, string[]>,
  )
  return rpc('COPY_STORAGE', JSON.stringify(map))
}

export function modifyCookie(uts: UrlAndTokenCookieNames[]) {
  return rpc('MODIFY_COOKIE', JSON.stringify(uts))
}

export function appendExecutorToIframe() {
  return rpc('APPEND_EXECUTOR_TO_IFRAME', '{}')
}

export function executeInSplitView(eisv: ExecuteInSplitView[]) {
  return rpc('EXECUTE_IN_SPLIT_VIEW', JSON.stringify(eisv))
}

export function allowIframeCsp(config: AllowIframeConfig) {
  config.regexFilters = config.regexFilters.map((regexFilter) => {
    if (!regexFilter.startsWith('/')) {
      regexFilter = `/${regexFilter}/`
    }
    return regexFilter
  })
  return rpc('ALLOW_IFRAME_CSP', JSON.stringify(config))
}

export function allowTransIframeCsp(config: AllowIframeConfig) {
  config.regexFilters = config.regexFilters.map((regexFilter) => {
    if (!regexFilter.startsWith('/')) {
      regexFilter = `/${regexFilter}/`
    }
    return regexFilter
  })
  return rpc('ALLOW_TRANS_IFRAME_CSP', JSON.stringify(config))
}

export function allowSplitViewCsp(config: AllowIframeConfig) {
  config.regexFilters = config.regexFilters.map((regexFilter) => {
    if (!regexFilter.startsWith('/')) {
      regexFilter = `/${regexFilter}/`
    }
    return regexFilter
  })
  return rpc('ALLOW_SPLIT_VIEW_CSP', JSON.stringify(config))
}

export function refreshSplitView(rsv: RefreshSplitView) {
  return rpc('REFRESH_SPLIT_VIEW', JSON.stringify(rsv))
}

function rpc(action: string, payload: unknown) {
  window.postMessage(
    {
      type: 'XMY_PREPARE_PAGE',
      action,
      payload,
    },
    '*',
  )

  return new Promise<void>((res, rej) => {
    const timer = setTimeout(() => {
      rej('timeout')
    }, 5000)

    window.addEventListener('message', (event) => {
      if (event.data.type === 'XMY_PREPARE_PAGE_DONE') {
        clearTimeout(timer)
        res(event.data)
      }
    })
  })
}
