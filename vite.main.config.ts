import { sentryVitePlugin } from '@sentry/vite-plugin'
import * as dotenv from 'dotenv'
import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig, mergeConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import {
  getBuildConfig,
  getBuildDefine,
  external,
  pluginHotRestart,
} from './vite.base.config'

function getDotEnv(defaults: Record<string, string>) {
  const env = {
    ...defaults,
    ...dotenv.config().parsed,
  }

  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [key, JSON.stringify(value)])
  )
}

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'build'>
  const { forgeConfigSelf } = forgeEnv

  const define = {
    ...getBuildDefine(forgeEnv),
    ...getDotEnv({
      GRAFANA_CLIENT_ID: 'f97d2ab099ee3747cbc2',
      K6_API_URL: 'https://api.k6.io/cloud/v6',
      GRAFANA_API_URL: 'https://grafana.com/api',
      GRAFANA_COM_URL: 'https://grafana.com',
    }),
  }

  const config: UserConfig = {
    build: {
      lib: {
        entry: forgeConfigSelf.entry!,
        fileName: () => '[name].js',
        formats: ['cjs'],
      },
      rollupOptions: {
        external: external.filter((id) => id !== 'openid-client'),
      },
      sourcemap: true,
    },
    plugins: [
      tsconfigPaths(),
      pluginHotRestart('restart'),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      }),
    ],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  }

  return mergeConfig(getBuildConfig(forgeEnv), config)
})
