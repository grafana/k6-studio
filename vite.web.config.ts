import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { version } from './package.json'

const repoRoot = path.resolve(__dirname)
const root = path.join(repoRoot, 'web')

export default defineConfig({
  root,
  base: './',
  appType: 'spa',
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  build: {
    outDir: path.join(repoRoot, '.vite/web'),
    emptyOutDir: true,
    sourcemap: true,
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    tsconfigPaths(),
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      'electron-log/renderer': path.join(
        repoRoot,
        'src/shims/electron-log-renderer.ts'
      ),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
    GRAFANA_COM_URL: JSON.stringify(
      process.env.GRAFANA_COM_URL ?? 'https://grafana.com'
    ),
    TARGET_PLATFORM: JSON.stringify('linux'),
    'import.meta.env.VITE_TARGET': JSON.stringify('web'),
    'import.meta.env.VITE_STUDIO_BRIDGE_WS': JSON.stringify(
      process.env.VITE_STUDIO_BRIDGE_WS ?? ''
    ),
  },
  clearScreen: false,
}) as UserConfig
