import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    includeSource: ['src/**/*.{js,ts}'],
    // e2e/ holds Playwright specs run via `pnpm test:e2e`, not vitest.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    alias: {
      'k6/http': fileURLToPath(
        new URL('./src/test/stubs/k6-http.ts', import.meta.url)
      ),
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
    __APP_VERSION__: JSON.stringify('0.0.0-vitest'),
    K6_TESTING_OVERRIDE: JSON.stringify(''),
  },
  resolve: {
    tsconfigPaths: true,
  },
})
