import { areDev } from '@/state/env'
import { reactive } from 'vue'

type Type = 'info' | 'warn' | 'success' | 'error'
interface Alert {
  type: Type
  visible: boolean
  message: string
}

export const alert = reactive<Alert>({
  type: 'info',
  visible: false,
  message: '',
})

export const info = (msg: string) => showAlert('info', msg)
export const warn = (msg: string) => showAlert('warn', msg)
export const success = (msg: string) => showAlert('success', msg)
export const error = (msg: string) => showAlert('error', msg)

if (areDev) {
  Object.assign(window, {
    alert,
  })
}

export function showAlert(type: Type, message: string) {
  alert.type = type
  alert.visible = true
  alert.message = message
}

export function closeAlert() {
  alert.visible = false
  alert.message = ''
}
