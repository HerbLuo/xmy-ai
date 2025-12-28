function parseFnJson<V>(str: string): V | null {
  try {
    return JSON.parse(str, (k, v) => {
      if (
        typeof v === 'string' &&
        v.indexOf &&
        (v.indexOf('function') > -1 || v.indexOf('=>') > -1)
      ) {
        return new Function(`return (function(){return ${v}})()`)()
      }
      return v
    })
  } catch (e) {
    console.warn('Failed to load state:', e)
    return null
  }
}

export function stringifyFnJson(obj: unknown, space?: number): string {
  return JSON.stringify(
    obj,
    (key, val) => {
      if (typeof val === 'function') {
        return val.toString()
      }
      return val
    },
    space,
  )
}

export function loadState<V>(key: string): V | null {
  const saved = localStorage.getItem(key)
  if (!saved) {
    return null
  }
  return parseFnJson<V>(saved)
}

export function saveState(key: string, obj: unknown) {
  localStorage.setItem(key, stringifyFnJson(obj))
}

export function loadStateMulti<V>(prefix: string): Record<string, V> {
  if (!prefix.endsWith('$')) {
    prefix = prefix + '$'
  }
  const keys = Object.keys(localStorage)
  const result: Record<string, V> = {}
  for (const key of keys) {
    if (key.startsWith(prefix)) {
      const obj = parseFnJson<V>(localStorage[key])
      if (obj) {
        result[key.replace(prefix, '')] = obj
      }
    }
  }
  return result
}

export function saveStateMulti(prefix: string, obj: Record<string, unknown>) {
  if (!prefix.endsWith('$')) {
    prefix = prefix + '$'
  }

  for (const [key, value] of Object.entries(obj)) {
    localStorage.setItem(prefix + key, stringifyFnJson(value))
  }
}
