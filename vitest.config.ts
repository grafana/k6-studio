import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    includeSource: ['src/**/*.{js,ts}'],
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      // @ts-expect-error We are targeting CommonJS so import.meta is not available
      'k6/http': new URL('./src/test/mocks/k6/http.ts', import.meta.url)
        .pathname,
      'k6/execution': new URL(
        './src/test/mocks/k6/execution.ts',
        // @ts-expect-error We are targeting CommonJS so import.meta is not available
        import.meta.url
      ).pathname,
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
    __APP_VERSION__: JSON.stringify('0.0.0-vitest'),
  },
})
