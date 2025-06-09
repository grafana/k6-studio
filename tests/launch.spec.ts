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
  // not loading without this await for some reason
  await body.count()
  expect(body).toBeVisible()
})


test('start recording', async () => {
  const testUrl = 'quickpizza.grafana.com'
  const recordingButton = await mainWindow.getByRole('link', { name: /record flow/i })
  await recordingButton.click()

  // insert test url
  const urlInput = mainWindow.getByRole('textbox', { name: /e\.g\./i })
  await urlInput.fill(testUrl)

  // start recording button
  const startRecording = await mainWindow.getByRole('button', { name: /start recording/i })
  expect(startRecording).toBeVisible()

  await startRecording.click()


  // requests are getting recorded, check row appears with quickpizza
  const pizzaRows = await mainWindow.locator('tr:has-text("quickpizza.grafana.com")')
  await pizzaRows.first().waitFor()

  expect(pizzaRows).first().toBeVisible()


  // stop recording
  const stopRecordingButton = await mainWindow.getByRole('button', { name: /Stop recording/i })
  expect(stopRecordingButton).toBeVisible()
  await stopRecordingButton.click()

  // assert we have the create test generator button
  const createTestGeneratorButton = await mainWindow.getByRole('button', { name: /Create test generator/i })
  expect(createTestGeneratorButton).toBeVisible()
})
