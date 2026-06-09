import { fileURLToPath } from 'node:url'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    includeSource: ['src/**/*.{js,ts}'],
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
})
