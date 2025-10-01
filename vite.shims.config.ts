import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    target: 'esnext',
    outDir: 'resources/shims',
    rollupOptions: {
      // By default, Vite will remove any top-level exports for entry files. This
      // disabled that behavior.
      preserveEntrySignatures: 'strict',
      input: {
        browser: 'src/main/runner/shims/browser/index.ts',
      },
      output: {
        entryFileNames: '[name].js',
      },
      external: ['k6', 'k6/http', 'k6/browser'],
    },
  },
})
