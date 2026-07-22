import { test, expect } from './fixtures'

test('packaged app launches and renders the Home view', async ({
  appWindow,
}) => {
  // Home renders unconditionally (no auth gate), so these markers prove the app
  // booted past the main process, preload, and renderer without crashing. The
  // card descriptions are unique to Home -- the short labels (Recorder, etc.)
  // also appear in the app shell nav and would match multiple elements.
  await expect(
    appWindow.getByText('Discover what you can do with Grafana k6 Studio')
  ).toBeVisible({ timeout: 20_000 })
  await expect(
    appWindow.getByText('Use our built-in proxy to record a user flow')
  ).toBeVisible()
  await expect(
    appWindow.getByText('Transform a recorded flow into a k6 test script')
  ).toBeVisible()
  await expect(
    appWindow.getByText('Debug and validate your k6 script')
  ).toBeVisible()
})
