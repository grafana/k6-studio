import { test, expect, _electron as electron } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'
import { findLatestBuild, parseElectronApp } from 'electron-playwright-helpers'

let electronApp: ElectronApplication
let mainWindow: Page
let splashscreenWindow: Page

test.beforeAll(async () => {
  const latestBuild = findLatestBuild()
  const appInfo = parseElectronApp(latestBuild)

  electronApp = await electron.launch({
    args: [appInfo.main],
    executablePath: appInfo.executable,
  })

  // splashscreen
  splashscreenWindow = await electronApp.firstWindow()
  mainWindow = await electronApp.waitForEvent('window')
})

test.afterAll(async () => {
  const pid = electronApp.process().pid
  if (pid !== undefined) {
    process.kill(pid)
  }
  // await electronApp.close()
  // on macos-latest closing might get stuck so we force kill it if we finished testing
  // try {
  //   await electronApp.close()
  // } catch (error) {
  //   console.error('Normal close failed, forcing close:', error)
  //   const pid = electronApp.process().pid
  //   if (pid !== undefined) {
  //     process.kill(pid)
  //   }
  // }
})

test('launch app', async () => {
  const title = await mainWindow.title()
  expect(title).toBe('Grafana k6 Studio')

  const body = splashscreenWindow.locator('body')
  // not loading without this await for some reason
  await body.count()
  expect(body).toBeVisible()
})

test('start recording', async () => {
  const testUrl = 'quickpizza.grafana.com'
  const recordingButton = mainWindow.getByRole('link', { name: /record flow/i })
  await recordingButton.click()

  // insert test url
  const urlInput = mainWindow.getByRole('textbox', { name: /e\.g\./i })
  await urlInput.fill(testUrl)

  // start recording button
  const startRecording = mainWindow.getByRole('button', {
    name: /start recording/i,
  })
  expect(startRecording).toBeVisible()

  await startRecording.click()

  // requests are getting recorded, check row appears with quickpizza
  const pizzaRows = mainWindow.locator('tr:has-text("quickpizza.grafana.com")')
  await pizzaRows.first().waitFor()

  expect(pizzaRows.first()).toBeVisible()

  // stop recording
  const stopRecordingButton = mainWindow.getByRole('button', {
    name: /Stop recording/i,
  })
  expect(stopRecordingButton).toBeVisible()
  await stopRecordingButton.click()

  // assert we have the create test generator button
  const createTestGeneratorButton = mainWindow.getByRole('button', {
    name: /Create test generator/i,
  })
  await createTestGeneratorButton.waitFor()
  expect(createTestGeneratorButton).toBeVisible()
})

test('create generator', async () => {
  // press the create test generator button
  const createTestGeneratorButton = mainWindow.getByRole('button', {
    name: /Create test generator/i,
  })
  await createTestGeneratorButton.click()

  // on the allowlist popup, press continue
  const allowlistContinue = mainWindow.getByRole('button', { name: 'Continue' })
  await allowlistContinue.click()

  // add new Custom code rule
  const addRule = mainWindow.getByRole('button', { name: 'Add rule' })
  await addRule.first().click()

  const customCode = mainWindow.getByRole('menuitem', { name: 'Custom code' })
  await customCode.click()

  // type in the rule
  const editor = mainWindow.getByRole('code').nth(1)
  await editor.click()
  await mainWindow.keyboard.type("console.log('hello test')")

  // save the generator
  const save = mainWindow.getByRole('button', { name: 'Save generator' })
  await save.click()

  // validate script
  const scriptTab = mainWindow.getByRole('tab', { name: 'Script' })
  await scriptTab.click()

  const validate = mainWindow.getByRole('button', { name: 'Validate' })
  await validate.click()

  // close button of Validator dialog is visible
  const closeValidator = mainWindow.getByRole('button', { name: 'Close' })
  await closeValidator.waitFor()
  expect(closeValidator).toBeVisible()
  await closeValidator.click()

  // go back to Home
  const home = mainWindow.getByRole('link', { name: 'Home' })
  await home.first().click()
})
