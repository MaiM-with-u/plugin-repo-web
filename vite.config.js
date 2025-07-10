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
  // 修复路径问题 - 根据部署环境设置正确的 base 路径
  // 部署到 plugin-repo 项目的 docs 目录，所以使用 /plugin-repo/
  base: process.env.NODE_ENV === 'production' ? '/plugin-repo/' : '/',
  build: {
    // 修复构建输出目录 - 输出到当前项目的 dist 目录
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    // 确保资源文件使用相对路径
    rollupOptions: {
      output: {
        // 修复 JavaScript 和 CSS 文件的命名，避免特殊字符导致的加载问题
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  }
})
