import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { version } from './package.json'
import { getDotEnv, pluginExposeRenderer } from './vite.base.config'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode, forgeConfigSelf } = forgeEnv
  const name = forgeConfigSelf.name ?? ''

  const { K6_TESTING_OVERRIDE } = getDotEnv({
    K6_TESTING_OVERRIDE: '',
  })

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
      sourcemap: true,
      // Electron always ships a current Chromium; avoid esbuild's legacy
      // browser targets (chrome87, …) which break dep pre-bundling for
      // packages that use destructuring + rest (e.g. @radix-ui/react-select).
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
      K6_TESTING_OVERRIDE,
    },
    clearScreen: false,
  } as UserConfig
})
