import type { BuildOptions, ConfigEnv, InlineConfig, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { version } from './package.json'
import webExtension from 'vite-plugin-web-extension'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode } = forgeEnv

  const plugins = [
    react({
      jsxImportSource: '@emotion/react',
    }),
    tsconfigPaths(),
  ]

  const build: BuildOptions = {
    outDir: `.vite/build/extension`,
    sourcemap: 'inline',
  }

  const viteConfig: InlineConfig = {
    plugins,
    build,
  }

  return {
    root,
    mode,
    base: './',
    build,
    plugins: [
      ...plugins,
      webExtension({
        disableAutoLaunch: process.env.STANDALONE_EXTENSION !== 'true',
        htmlViteConfig: viteConfig,
        scriptViteConfig: viteConfig,

        manifest: () => {
          return {
            name: 'k6 Studio',
            version,
            manifest_version: 3,
            background: {
              service_worker: 'extension/src/background.ts',
            },
            content_scripts: [
              {
                matches: ['<all_urls>'],
                js: ['extension/src/recorder.ts'],
              },
            ],
            permissions: ['webNavigation'],
          }
        },
      }),
    ],
    resolve: {
      preserveSymlinks: true,
    },
    clearScreen: false,
  } as UserConfig
})
