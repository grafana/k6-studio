import path from 'path'
import { ConfigEnv, defineConfig, mergeConfig, UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { getBuildConfig } from './vite.base.config'

/** Single-file bundle so k6 archive resolves only `http-entrypoint.js` next to the temp script. */
export default defineConfig((env) => {
  return mergeConfig(getBuildConfig(env as ConfigEnv<'build'>), {
    plugins: [tsconfigPaths()],
    mode: env.mode,
    build: {
      sourcemap: false,
      minify: false,
      target: 'esnext',
      lib: {
        entry: path.resolve(__dirname, 'src/main/runner/httpEntrypoint.ts'),
        fileName: () => 'http-entrypoint.js',
        formats: ['es'],
      },
      outDir: 'resources',
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
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
