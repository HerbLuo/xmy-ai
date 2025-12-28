import { ref } from 'vue'

export const areDev = !!import.meta.env.DEV

export const mobileMode = ref(!!window.mobileMode)

export const largeScreen = () => window.innerWidth > 620

setInterval(() => {
  if (mobileMode.value != !!window.mobileMode) {
    mobileMode.value = !!window.mobileMode
  }
}, 500)
