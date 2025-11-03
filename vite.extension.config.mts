import react from '@vitejs/plugin-react'
import type { BuildOptions, ConfigEnv, InlineConfig, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import webExtension from 'vite-plugin-web-extension'
import tsconfigPaths from 'vite-tsconfig-paths'
import type { Manifest } from 'webextension-polyfill'

import { version } from './package.json'

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
    minify: false,
    outDir: `.vite/build/extension`,
    sourcemap: 'inline',
  }

  const viteConfig: InlineConfig = {
    plugins,
    build,
    define: {
      STANDALONE_EXTENSION: JSON.stringify(
        process.env.STANDALONE_EXTENSION === 'true'
      ),
      TARGET_PLATFORM: JSON.stringify(process.platform),
    },
  }

  return {
    root,
    mode,
    base: './',
    build,
    plugins: [
      ...plugins,
      webExtension({
        webExtConfig: {
          target: 'chromium',
          startUrl: 'https://quickpizza.grafana.com',
        },
        disableAutoLaunch: process.env.STANDALONE_EXTENSION !== 'true',
        htmlViteConfig: viteConfig,
        scriptViteConfig: viteConfig,

        manifest: (): Manifest.WebExtensionManifest => {
          return {
            name: 'k6 Studio',
            version: version.replace(/-.*/, ''),
            manifest_version: 3,
            background: {
              service_worker: 'extension/src/background/index.ts',
            },
            content_scripts: [
              {
                run_at: 'document_start',
                matches: ['<all_urls>'],
                js: ['extension/src/frontend/index.ts'],
              },
            ],
            permissions: ['webNavigation', 'storage', 'tabs'],
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
