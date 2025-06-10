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
  await electronApp.close()
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
  console.log('created test generator')

  // on the allowlist popup, press continue
  const allowlistContinue = mainWindow.getByRole('button', { name: 'Continue' })
  await allowlistContinue.click()
  console.log('pressed continue on allowlist')

  // add new Custom code rule
  const addRule = mainWindow.getByRole('button', { name: 'Add rule' })
  await addRule.first().click()
  console.log('add rule click')

  const customCode = mainWindow.getByRole('menuitem', { name: 'Custom code' })
  await customCode.click()
  console.log('custom code click')

  // type in the rule
  const editor = mainWindow.getByRole('code').nth(1)
  await editor.click()
  await mainWindow.keyboard.type("console.log('hello test')")
  console.log('type in the custom code editor')

  // save the generator
  const save = mainWindow.getByRole('button', { name: 'Save generator' })
  await save.click()
  console.log('saved generator')

  // validate script
  const scriptTab = mainWindow.getByRole('tab', { name: 'Script' })
  await scriptTab.click()
  console.log('changed to script tab')

  const validate = mainWindow.getByRole('button', { name: 'Validate' })
  await validate.click()
  console.log('pressed validate')

  // close button of Validator dialog is visible
  const closeValidator = mainWindow.getByRole('button', { name: 'Close' })
  expect(closeValidator).toBeVisible()
  console.log('closed validation and finished test')
})
