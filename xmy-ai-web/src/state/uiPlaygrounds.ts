import { loadStateMulti, saveStateMulti } from '@/utils/storage-persistor'
import { reactive } from 'vue'
import { unwrap, type CheckResult } from './types'
import { confirmError } from '@/utils/error'

const StoragePrefix = 'lambs_ini_ui_playgrounds'
export const getUiPlaygroundStorageKey = (key: string) => `lambs_ini_ui_playgrounds$${key}`

export type QuestionOptions = {
  all: boolean
  network: boolean
  deep: boolean
  translate: boolean
}
export type Playground = {
  questionOptions: QuestionOptions
  pages: string[]
  prefixs: Record<string, string>
  times: number
}
const storage = loadStateMulti<Playground>(StoragePrefix)
export const ini_ui_playgrounds: Record<string, Playground> = reactive(
  unwrap(typeCheck(storage)) || {},
)

function typeCheck(
  playgrounds: Record<string, Playground> | null,
): CheckResult<Record<string, Playground> | null> {
  if (!playgrounds) {
    return { data: null }
  }
  for (const [, playground] of Object.entries(playgrounds)) {
    if (!playground.pages || !(playground.pages instanceof Array)) {
      return { error: '属性`ui.playgrounds.pages`必需为数组' }
    }
    if (!playground.prefixs) {
      return { error: '属性`ui.playgrounds.prefixs`必填' }
    }
    if (!playground.questionOptions) {
      return { error: '属性`ui.playgrounds.questionOptions`必填' }
    }
    if (typeof playground.times !== 'number') {
      return { error: '属性`ui.playgrounds.times`必需为数字，代表提问次数' }
    }
  }
  return {
    data: playgrounds,
  }
}

export function replacePlaygrounds(data: Record<string, Playground>) {
  const checked = typeCheck(data)
  if (checked.error) {
    throw confirmError(checked.error)
  }
  for (const key of Object.keys(ini_ui_playgrounds)) {
    delete ini_ui_playgrounds[key]
  }
  for (const [key, value] of Object.entries(data)) {
    ini_ui_playgrounds[key] = value
  }

  saveStateMulti(StoragePrefix, ini_ui_playgrounds)
}
