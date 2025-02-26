import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig, mergeConfig } from 'vite'
import {
  getBuildConfig,
  getBuildDefine,
  external,
  pluginHotRestart,
} from './vite.base.config'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import * as dotenv from 'dotenv'

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
      GRAFANA_CLIENT_ID: '69039f7a39d7e1281861',
      K6_API_URL: 'https://api.staging.k6.io/v6',
      MOCK_PERSONAL_API_TOKEN: 'I AM NOT A REAL TOKEN!!!',
      GRAFANA_API_URL: 'https://grafana-dev.com/api',
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
