import { loadState, saveState } from '@/utils/storage-persistor'
import { reactive, ref, watch } from 'vue'
import { unwrap, type CheckResult } from './types'
import { confirmError, tipError } from '@/utils/error'

const StorageKey = 'lambs_ini_ui_workspace'

export type Workspace = {
  key: string
  title: string
  actived?: boolean
}
const storage = loadState<Workspace[]>(StorageKey)
export const ini_ui_workspace: Workspace[] = reactive(
  unwrap(typeCheck(storage)) || [
    {
      key: 'default',
      title: '默认',
      actived: true,
    },
  ],
)

export const currentWorkspace = ref<Workspace>(ini_ui_workspace[0]!)
watch(
  () => ini_ui_workspace,
  () => {
    const ls = ini_ui_workspace.find((it) => it.actived) || ini_ui_workspace[0]
    if (!ls) {
      throw tipError('找不到actived的workspace')
    }
    if (currentWorkspace.value != ls) {
      currentWorkspace.value = ls
    }
  },
  { deep: true, immediate: true },
)

export function switchLayout(key: string) {
  for (const ls of ini_ui_workspace) {
    ls.actived = false
  }
  const ls = ini_ui_workspace.find((it) => it.key === key)
  if (ls) {
    ls.actived = true
  }
  saveState(StorageKey, ini_ui_workspace)
}

function typeCheck(workspace: Workspace[] | null): CheckResult<Workspace[] | null> {
  if (!workspace) {
    return { data: null }
  }
  if (!(workspace instanceof Array)) {
    return { error: '属性`ini.ui.workspace`只能为数组' }
  }
  let actived = false
  const keys = new Set()
  for (const ls of workspace) {
    if (!ls.key) {
      return { error: '属性`ini.ui.workspace.key`必填' }
    }
    if (!ls.title) {
      return { error: '属性`ini.ui.workspace.title`必填' }
    }
    if (keys.has(ls.key)) {
      return { error: '属性`ini.ui.workspace.key`不能重复' }
    }
    keys.add(ls.key)
    if (ls.actived) {
      if (!actived) {
        actived = true
      } else {
        return { error: '属性`ini.ui.workspace`只能有一个actived的项目' }
      }
    }
  }
  if (!actived) {
    return { error: '属性`ini.ui.workspace`必须有一个actived的项目' }
  }
  return {
    data: workspace,
  }
}

export function replaceLayoutSwitching(data: Workspace[]) {
  const checked = typeCheck(data)
  if (checked.error) {
    throw confirmError(checked.error)
  }
  ini_ui_workspace.length = 0
  ini_ui_workspace.push(...data)

  saveState(StorageKey, ini_ui_workspace)
}
