import { confirmError } from '@/utils/error'

export interface CheckResult<T> {
  data?: T
  error?: string
}

export function unwrap<T>(res: CheckResult<T>): T | null | undefined {
  if (res.error) {
    confirmError(
      '加载本地配置遇到了一个错误：' +
        res.error +
        '。回退到了默认配置，尝试清空LocalStorage或者更正错误。',
    )
    return null
  }
  return res.data
}
