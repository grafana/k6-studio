import { defineConfig } from 'vitest/config'
import viteTsconfigPaths from 'vite-tsconfig-paths'

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
