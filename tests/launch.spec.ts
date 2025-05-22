const { ElectronApplication, Page, test, expect, _electron: electron } = require('@playwright/test')
import {
  findLatestBuild,
  parseElectronApp,
} from 'electron-playwright-helpers'


let electronApp: ElectronApplication
let mainWindow: Page
let splashscreenWindow: Page


test.beforeAll(async () => {
  const latestBuild = findLatestBuild()
  const appInfo = parseElectronApp(latestBuild)

  electronApp = await electron.launch({
    args: [appInfo.main],
    executablePath: appInfo.executable
  })

  // splashscreen
  splashscreenWindow = await electronApp.firstWindow()
  mainWindow = await electronApp.waitForEvent('window')
})

test.afterAll(async () => {
  await electronApp.close()
})

test('launch app', async () => {
  const title = await mainWindow.title()
  expect(title).toBe('Grafana k6 Studio')

  const body = await splashscreenWindow.locator('body');
  expect(body).toBeVisible()
})
