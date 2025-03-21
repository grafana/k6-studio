import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    includeSource: ['src/**/*.{js,ts}'],
    environment: 'jsdom',
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
})
