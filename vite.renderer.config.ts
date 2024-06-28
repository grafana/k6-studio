import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pluginExposeRenderer } from './vite.base.config'
import tsconfigPaths from 'vite-tsconfig-paths'

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
    },
    plugins: [react(), pluginExposeRenderer(name), tsconfigPaths()],
    resolve: {
      preserveSymlinks: true,
    },
    clearScreen: false,
  } as UserConfig
})
