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
        entry: 'src/main/runner/shims/k6-testing/index.ts',
        fileName: () => 'k6-testing.js',
        formats: ['es'],
      },
      outDir: 'resources',
      rollupOptions: {
        external: [
          'k6',
          'k6/http',
          'k6/browser',
          'k6/execution',
          '__K6_TESTING_EXPECT_PATH__',
        ],
      },
    },
    resolve: {
      tsconfigPaths: true,
    },
  } satisfies UserConfig)
})
