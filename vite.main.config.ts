import { sentryVitePlugin } from '@sentry/vite-plugin'
import { execSync } from 'node:child_process'
import {
  defineConfig,
  mergeConfig,
  type ConfigEnv,
  type UserConfig,
} from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import {
  getBuildConfig,
  getBuildDefine,
  getDotEnv,
  getExternal,
  pluginHotRestart,
} from './vite.base.config'

function getGitBranch(): string | null {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: import.meta.dirname,
    })

    return branch.toString().trim()
  } catch (error) {
    console.log("Couldn't get git branch:", error)

    return null
  }
}

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'build'>
  const { forgeConfigSelf } = forgeEnv

  const gitBranch = forgeEnv.command === 'serve' ? getGitBranch() : null

  const define = {
    ...getBuildDefine(forgeEnv),
    ...getDotEnv({
      GRAFANA_CLIENT_ID: 'f97d2ab099ee3747cbc2',
      K6_API_URL: 'https://api.k6.io/cloud/v6',
      GRAFANA_API_URL: 'https://grafana.com/api',
      GRAFANA_COM_URL: 'https://grafana.com',
      K6_TESTING_OVERRIDE: '',
    }),
    DEV_GIT_BRANCH: JSON.stringify(gitBranch),
  }

  const config: UserConfig = {
    build: {
      lib: {
        entry: forgeConfigSelf.entry,
        fileName: () => '[name].js',
        formats: ['cjs'],
      },
      rollupOptions: {
        external: getExternal(env.command),
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
