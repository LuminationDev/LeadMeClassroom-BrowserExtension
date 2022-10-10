import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
// @ts-ignore
import manifest from './manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      vue(),
      crx({ manifest })
  ],
  build: {
    rollupOptions: {
      input: {
        dashboard: 'src\\pages\\dashboard\\dashboard.html',
        options: 'src\\pages\\options\\options.html',
        assistant: 'src\\pages\\assistant\\assistant.html',
      },
    },
  }
})
