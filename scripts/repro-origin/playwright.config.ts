import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.e2e.ts',
  workers: 1,
  reporter: 'list',
  timeout: 30_000,
})
