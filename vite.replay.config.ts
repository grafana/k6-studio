import { ConfigEnv, defineConfig, mergeConfig, UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { getBuildConfig } from './vite.base.config'

export default defineConfig((env) => {
  return mergeConfig(getBuildConfig(env as ConfigEnv<'build'>), {
    plugins: [tsconfigPaths()],
    mode: env.mode,
    build: {
      sourcemap: false,
      target: 'esnext',
      lib: {
        entry: 'src/main/runner/shims/browser/replay.ts',
        name: 'replay',
        fileName: () => 'replay.js',
        // The replay script needs to be an IIFE to avoid polluting the global scope
        // of the recorded page.
        formats: ['iife'],
      },
      outDir: 'resources',
      rollupOptions: {
        // By default, Vite will remove any top-level exports for entry files. This
        // disabled that behavior.
        external: [
          'k6',
          'k6/http',
          'k6/browser',
          'k6/execution',
          '__USER_SCRIPT_PATH__',
        ],
      },
    },
  } satisfies UserConfig)
})
