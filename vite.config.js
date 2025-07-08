import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 配置为 GitHub Pages 部署
  base: process.env.NODE_ENV === 'production' ? '/plugin-repo/' : '/',
  build: {
    outDir: '../plugin-repo/docs',
    emptyOutDir: true,
    assetsDir: 'assets'
  }
})
