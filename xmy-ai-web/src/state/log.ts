import { nextTick, ref } from 'vue'

export const logs = ref<string[]>([])

export const log = {
  append(msg: string) {
    logs.value?.push(msg)
    nextTick(() => {
      const el = document.querySelector('#log-box')
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    })
  },
}

Object.assign(window, { log })
