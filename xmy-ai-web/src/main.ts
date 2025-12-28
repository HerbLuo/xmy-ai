import './main.css'

import { createApp } from 'vue'
import App from './App.vue'

import CpSvgIcon from '@/components/CpSvgIcon.vue'
import { i18n } from './state/i18n'

createApp(App).use(i18n).component('CpSvgIcon', CpSvgIcon).mount('#app')

declare module 'vue' {
  export interface GlobalComponents {
    CpSvgIcon: typeof CpSvgIcon
  }
}

declare global {
  interface Window {
    mobileMode?: boolean
  }
}
