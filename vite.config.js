import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/

const viteConfigs = {
  plugins: [
    vue(),
    vueDevTools(),
  ],
  base: "./",
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src_view', import.meta.url))
    },
  },
  build: {
    minify: process.env.NODE_ENV!=='develop'
  }
}

export default defineConfig(viteConfigs);
