import { ConfigEnv, defineConfig, mergeConfig, UserConfig } from 'vite'

import { getBuildConfig } from './vite.base.config'

export default defineConfig((env) => {
  return mergeConfig(getBuildConfig(env as ConfigEnv<'build'>), {
    mode: env.mode,
    build: {
      sourcemap: false,
      minify: false,
      target: 'esnext',
      lib: {
        entry: 'src/main/runner/entrypoint.ts',
        fileName: () => 'entrypoint.js',
        formats: ['es'],
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
    resolve: {
      tsconfigPaths: true,
    },
  } satisfies UserConfig)
})
