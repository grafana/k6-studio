import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { version } from './package.json'
import { pluginExposeRenderer } from './vite.base.config'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode, forgeConfigSelf } = forgeEnv
  const name = forgeConfigSelf.name ?? ''

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
      sourcemap: true,
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
      }),
      pluginExposeRenderer(name),
      tsconfigPaths(),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      }),
    ],
    resolve: {
      preserveSymlinks: true,
    },
    define: {
      __APP_VERSION__: JSON.stringify(version),
      GRAFANA_COM_URL: JSON.stringify(
        process.env.GRAFANA_COM_URL ?? 'https://grafana.com'
      ),
      TARGET_PLATFORM: JSON.stringify(process.platform),
    },
    clearScreen: false,
  } as UserConfig
})
