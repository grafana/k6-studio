import { app, BrowserWindow } from 'electron'
import {
  computeSystemExecutablePath,
  Browser,
  ChromeReleaseChannel,
  launch,
} from '@puppeteer/browsers'
import { getCertificateSPKI } from './proxy'
import { mkdtemp } from 'fs/promises'
import path from 'path'
import os from 'os'
import { appSettings } from './main'
import { BrowserServer } from './services/browser/server'

const createUserDataDir = async () => {
  return mkdtemp(path.join(os.tmpdir(), 'k6-studio-'))
}

function getBrowserPath() {
  const { recorder } = appSettings

  if (recorder.detectBrowserPath) {
    return computeSystemExecutablePath({
      browser: Browser.CHROME,
      channel: ChromeReleaseChannel.STABLE,
    })
  }

  return recorder.browserPath as string
}

function getExtensionPath() {
  // @ts-expect-error - Electron apps are built as CJS.
  if (import.meta.env.DEV) {
    return path.join(app.getAppPath(), '.vite/build/extension')
  }

  return path.join(process.resourcesPath, 'extension')
}

export const launchBrowser = async (
  browserWindow: BrowserWindow,
  browserServer: BrowserServer,
  url?: string
) => {
  const path = getBrowserPath()
  console.info(`browser path: ${path}`)

  const userDataDir = await createUserDataDir()
  console.log(userDataDir)
  const certificateSPKI = await getCertificateSPKI()

  const optimizationsToDisable = [
    'OptimizationGuideModelDownloading',
    'OptimizationHintsFetching',
    'OptimizationTargetPrediction',
    'OptimizationHints',
  ]
  const disableChromeOptimizations = `--disable-features=${optimizationsToDisable.join(',')}`

  const extensionPath = getExtensionPath()
  console.info(`extension path: ${extensionPath}`)

  if (appSettings.recorder.enableBrowserRecorder) {
    browserServer.start(browserWindow)
  }

  const handleBrowserClose = async (): Promise<void> => {
    await browserServer.stop()

    // we send the browser:stopped event when the browser is closed
    // NOTE: on macos pressing the X button does not close the application so it won't be fired
    browserWindow.webContents.send('browser:closed')
  }

  return launch({
    executablePath: path,
    args: [
      '--new',
      '--args',
      `--user-data-dir=${userDataDir}`,
      '--hide-crash-restore-bubble',
      '--test-type',
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-search-engine-choice-screen',
      `--proxy-server=http://localhost:${appSettings.proxy.port}`,
      `--ignore-certificate-errors-spki-list=${certificateSPKI}`,
      appSettings.recorder.enableBrowserRecorder
        ? `--load-extension=${extensionPath}`
        : '',
      disableChromeOptimizations,
      url?.trim() || 'about:blank',
    ],
    onExit: handleBrowserClose,
  })
}
