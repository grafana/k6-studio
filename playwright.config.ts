import { defineConfig } from '@playwright/test'

// E2E smoke tests launch the packaged Electron app, so they cannot run in
// parallel against a shared `out/` build and have no use for browser projects.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
})
