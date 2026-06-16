import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { defineConfig, type ConfigEnv, type UserConfig } from 'vite'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode } = forgeEnv
  const nodeEnv = process.env.NODE_ENV || 'production'

  return {
    root,
    mode,
    base: './',
    define: {
      TARGET_PLATFORM: JSON.stringify(process.platform),
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
      // fix for react-is lib in packaged mode
      process: JSON.stringify({
        env: {
          NODE_ENV: nodeEnv,
        },
      }),
    },
    build: {
      target: 'esnext',
      outDir: `resources/browser`,
      sourcemap: 'inline',
      lib: {
        entry: 'src/recorder/browser/index.ts',
        formats: ['iife'],
        name: '__k6_studio_cdp__',
        fileName: () => 'index.js',
      },
      rollupOptions: {
        output: {
          preserveModules: false,
          minifyInternalExports: false,
        },
        treeshake: 'safest',
        preserveEntrySignatures: 'strict',
      },
    },
    plugins: [
      {
        name: 'inline-woff2',
        load(id) {
          if (!id.endsWith('.woff2')) return null
          const base64 = readFileSync(id).toString('base64')
          return `export default "data:font/woff2;base64,${base64}"`
        },
      },
      react({
        jsxImportSource: '@emotion/react',
      }),
    ],
    resolve: {
      preserveSymlinks: true,
      // Force vite to use browser-specific package exports
      conditions: ['browser', 'import', 'module', 'default'],
      tsconfigPaths: true,
    },
    clearScreen: false,
  } as UserConfig
})
