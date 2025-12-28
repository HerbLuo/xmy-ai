import { loadState, saveState } from '@/utils/storage-persistor'
import { reactive, ref, watch, type CSSProperties } from 'vue'
import { unwrap, type CheckResult } from './types'
import { confirmError, tipError } from '@/utils/error'

const StorageKey = 'lambs_ini_ui_layout_switching'

export type LayoutSwitching = {
  key: string
  icon: string
  count: number
  actived?: boolean
  style: CSSProperties
  zoomIn?: CSSProperties[]
}
const storage = loadState<LayoutSwitching[]>(StorageKey)
export const ini_ui_layout_switching: LayoutSwitching[] = reactive(
  unwrap(typeCheck(storage)) || [
    {
      key: 'ls1',
      icon: 'layout1',
      count: 1,
      style: {
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
      },
    },
    {
      key: 'ls2',
      icon: 'layout2',
      count: 2,
      style: {
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr',
      },
      zoomIn: [{ gridTemplateColumns: '4fr 1fr' }, { gridTemplateColumns: '1fr 4fr' }],
    },
    {
      key: 'ls3',
      icon: 'layout3',
      actived: true,
      count: 3,
      style: {
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr',
      },
      zoomIn: [
        { gridTemplateColumns: '3fr 1fr 1fr' },
        { gridTemplateColumns: '1fr 3fr 1fr' },
        { gridTemplateColumns: '1fr 1fr 3fr' },
      ],
    },
    {
      key: 'ls4_2',
      icon: 'layout4_2',
      count: 4,
      style: {
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: '1fr',
      },
      zoomIn: [
        { gridTemplateColumns: '5fr 1fr 1fr 1fr', gridTemplateRows: '1fr' },
        { gridTemplateColumns: '1fr 5fr 1fr 1fr', gridTemplateRows: '1fr' },
        { gridTemplateColumns: '1fr 1fr 5fr 1fr', gridTemplateRows: '1fr' },
        { gridTemplateColumns: '1fr 1fr 1fr 5fr', gridTemplateRows: '1fr' },
      ],
    },
    {
      key: 'ls4',
      icon: 'layout4',
      count: 4,
      style: {
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
      },
      zoomIn: [
        { gridTemplateColumns: '3fr 1fr', gridTemplateRows: '3fr 1fr' },
        { gridTemplateColumns: '1fr 3fr', gridTemplateRows: '3fr 1fr' },
        { gridTemplateColumns: '3fr 1fr', gridTemplateRows: '1fr 3fr' },
        { gridTemplateColumns: '1fr 3fr', gridTemplateRows: '1fr 3fr' },
      ],
    },
    {
      key: 'ls5',
      icon: 'layout6',
      count: 6,
      style: {
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
      },
      zoomIn: [
        { gridTemplateColumns: '3fr 1fr 1fr', gridTemplateRows: '3fr 1fr' },
        { gridTemplateColumns: '1fr 3fr 1fr', gridTemplateRows: '3fr 1fr' },
        { gridTemplateColumns: '1fr 1fr 3fr', gridTemplateRows: '3fr 1fr' },
        { gridTemplateColumns: '3fr 1fr 1fr', gridTemplateRows: '1fr 3fr' },
        { gridTemplateColumns: '1fr 3fr 1fr', gridTemplateRows: '1fr 3fr' },
        { gridTemplateColumns: '1fr 1fr 3fr', gridTemplateRows: '1fr 3fr' },
      ],
    },
  ],
)

function initFromUrl() {
  const search = new URLSearchParams(window.location.search)
  const layout = search.get('layout')
  if (layout) {
    for (const ls of ini_ui_layout_switching) {
      ls.actived = false
    }
    const ls = ini_ui_layout_switching.find((it) => it.key === layout)
    if (ls) {
      ls.actived = true
    }
  }
}
initFromUrl()

export const currentLayoutSwitching = ref<LayoutSwitching>(ini_ui_layout_switching[0]!)

watch(
  () => ini_ui_layout_switching,
  () => {
    const ls = ini_ui_layout_switching.find((it) => it.actived)
    if (!ls) {
      throw tipError('找不到actived的layoutSwitching')
    }
    if (ls !== currentLayoutSwitching.value) {
      currentLayoutSwitching.value = ls
    }
  },
  { deep: true, immediate: true },
)

export function switchLayout(key: string) {
  for (const ls of ini_ui_layout_switching) {
    ls.actived = false
  }
  const ls = ini_ui_layout_switching.find((it) => it.key === key)
  if (ls) {
    ls.actived = true
  }

  saveState(StorageKey, ini_ui_layout_switching)

  const url = new URL(window.location.href)
  url.searchParams.set('layout', key)
  history.replaceState({}, '', url.toString())
}

function typeCheck(
  layoutSwitching: LayoutSwitching[] | null,
): CheckResult<LayoutSwitching[] | null> {
  if (!layoutSwitching) {
    return { data: null }
  }
  if (!(layoutSwitching instanceof Array)) {
    return { error: '属性`ini.ui.layout_switching`只能为数组' }
  }
  let actived = false
  const keys = new Set()
  for (const ls of layoutSwitching) {
    if (!ls.key) {
      return { error: '属性`ini.ui.layout_switching.key`必填' }
    }
    if (!ls.icon) {
      return { error: '属性`ini.ui.layout_switching.icon`必填' }
    }
    if (keys.has(ls.key)) {
      return { error: '属性`ini.ui.layout_switching.key`不能重复' }
    }
    if (typeof ls.count !== 'number') {
      return { error: '属性`ini.ui.layout_switching.count`只能大于0' }
    }
    if (ls.count <= 0) {
      return { error: '属性`ini.ui.layout_switching.count`只能大于0' }
    }
    keys.add(ls.key)
    if (ls.actived) {
      if (!actived) {
        actived = true
      } else {
        return { error: '属性`ini.ui.layout_switching`只能有一个actived的项目' }
      }
    }
  }
  if (!actived) {
    return { error: '属性`ini.ui.layout_switching`必须有一个actived的项目' }
  }
  return {
    data: layoutSwitching,
  }
}

export function replaceLayoutSwitching(data: LayoutSwitching[]) {
  const checked = typeCheck(data)
  if (checked.error) {
    throw confirmError(checked.error)
  }
  ini_ui_layout_switching.length = 0
  ini_ui_layout_switching.push(...data)

  saveState(StorageKey, ini_ui_layout_switching)
}
