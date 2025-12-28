import { error as tip } from './message'
import { error as alert } from './alert'

export function tipError(msg: string) {
  tip(msg)
  return new Error(msg)
}

export function confirmError(msg: string) {
  alert(msg)
  return new Error(msg)
}
