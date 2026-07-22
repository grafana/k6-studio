import { defineConfig } from '@playwright/test'

// E2E smoke tests launch the packaged Electron app, so they cannot run in
// parallel against a shared `out/` build and have no use for browser projects.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  // Per-test timeout covers fixture setup AND the test body. The appWindow
  // fixture can wait up to 30s for the CDP port + 20s for the renderer, then the
  // spec allows 20s for the first assertion (~70s worst case), so keep this
  // comfortably above that ceiling to avoid cutting off a slow CI startup.
  timeout: 120_000,
})
