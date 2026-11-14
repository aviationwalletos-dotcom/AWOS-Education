/// <reference types="vitest" />
import { readFileSync } from 'node:fs'

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// 붙는 주소(basePath)는 module.config.json 이 기준이다. 다른 주소로 올릴 때만 VITE_BASE_PATH 로 덮어쓴다.
const moduleConfig = JSON.parse(readFileSync(new URL('./module.config.json', import.meta.url), 'utf8'))

function normalizeBase(value: string): string {
  const trimmed = `/${value}/`.replace(/\/{2,}/g, '/')
  return trimmed === '//' ? '/' : trimmed
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: normalizeBase(env.VITE_BASE_PATH || moduleConfig.basePath),
    plugins: [react()],
    test: {
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }
})
