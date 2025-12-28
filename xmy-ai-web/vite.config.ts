import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import VitePluginSvgSpritemap from '@spiriit/vite-plugin-svg-spritemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement(tag) {
            return [
              "lb-theme", "lb-content", "svg-ico", "layout-switching", "lb-setting", 
              "question-bar", "question-options", "ai-page", "ai-switcher",
              "switcher-options", "switcher-option", "switcher-current", "ai-buttons", "ai-button",
              "install-plugin-tip", "modal-backdrop", "modal-backgroun", "modal-content",
              "setting-content", "setting-group", "setting-group-name",
              "setting-line", "setting-box", "setting-name", "opt-box", "opt-cur",
              "modal-title", "modal-background", "modal-wrapper", "page-selector", "page-select",
              "ai-table", "ai-config-box", "ai-config-title", "table-container", "th-bg",
              "ai-config-title-left", "ai-config-title-right", "modal-action-bar", "header-right", 
              "log-box", "scroll-container", "ai-tag", "split-view", "message-box", "message-boxs",
              "message-tip", "message-tips", "alert-background", "alert-box", "alert-content", "alert-action-bar",
              "bei-an"
            ].includes(tag)
          }
        }
      }
    }),
    vueJsx(),
    vueDevTools(),
    VitePluginSvgSpritemap('./src/icons/*.svg')
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      mangle: {
        reserved: [
          "delay", "findEl", "setValue", "emitEnter", "sendMsg", "checkLogin"
        ]
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const packageName = id.split('node_modules/')[1].split('/')[0]
            if (['@vue'].includes(packageName)) {
              return `v-${packageName.replace("@", "")}`
            }
            return 'v-others'
          }
          if (id.includes("aios.ts")) {
            return "aio"
          }
        },
      },
    },
  },
})
