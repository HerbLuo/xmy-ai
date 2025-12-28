import { areDev } from '@/state/env'
import { ref } from 'vue'

type Type = 'info' | 'warn' | 'success' | 'error'
interface Message {
  type: Type
  message: string
}

export const messages = ref<Message[]>([])

export const info = (msg: string, duration?: number) => message('info', msg, duration)
export const warn = (msg: string, duration?: number) => message('warn', msg, duration)
export const success = (msg: string, duration?: number) => message('success', msg, duration)
export const error = (msg: string, duration?: number) => message('error', msg, duration)

if (areDev) {
  Object.assign(window, {
    message: {
      info,
      warn,
      success,
      error,
    },
  })
}

export function message(type: Type, message: string, duration?: number) {
  messages.value.push({ type, message })
  if (!duration) {
    duration = message.length * 300 + 2000
    if (duration > 10000) {
      duration = 10000
    }
  }
  if (duration < 30) {
    duration = duration * 1000
  }
  setTimeout(() => {
    const index = messages.value.findIndex((msg) => msg.message === message)
    if (index > -1) {
      messages.value.splice(index, 1)
    }
  }, duration)
}
