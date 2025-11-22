import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  // Allow overriding the public base at build time (default works for Electron/file:// and root hosting).
  base: process.env.VITE_BASE_PATH ?? './',
  plugins: [react()],
  resolve: {
    alias: {
      '@tests': resolve(__dirname, '../json/Tests'),
      '@lessons': resolve(__dirname, '../json/Lessons'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          phaser: ['phaser'],
        },
      },
    },
  },
  server: {
    fs: {
      allow: [resolve(__dirname, '..')],
    },
  },
})
