import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    tsconfigPaths(),
  ],
  define: {
    TARGET_PLATFORM: JSON.stringify(process.platform),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  build: {
    outDir: 'resources/browser',
    lib: {
      entry: 'extension/src/frontend/cdp.ts',
      formats: ['iife'],
      name: 'cdp',
      fileName() {
        return 'frontend.js'
      },
    },
    sourcemap: 'inline',
  },
})
