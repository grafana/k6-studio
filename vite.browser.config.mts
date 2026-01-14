import react from '@vitejs/plugin-react'
import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode } = forgeEnv

  return {
    root,
    mode,
    base: './',
    define: {
      TARGET_PLATFORM: JSON.stringify(process.platform),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      process: JSON.stringify({
        env: {
          NODE_ENV: process.env.NODE_ENV || 'production',
        },
      }),
    },
    build: {
      target: 'esnext',
      outDir: `resources/browser`,
      sourcemap: 'inline',
      lib: {
        entry: 'extension/src/cdp/index.ts',
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
      react({
        jsxImportSource: '@emotion/react',
      }),
      tsconfigPaths(),
    ],
    resolve: {
      preserveSymlinks: true,
      // Force vite to use browser-specific package exports
      conditions: ['browser', 'import', 'module', 'default'],
    },
    clearScreen: false,
  } as UserConfig
})
