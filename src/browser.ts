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
import { exec, spawn } from 'child_process'
import { getPlatform } from './utils/electron'
import log from 'electron-log/main'

const createUserDataDir = async () => {
  return mkdtemp(path.join(os.tmpdir(), 'k6-studio-'))
}

export async function getBrowserPath() {
  const { recorder } = appSettings

  if (recorder.detectBrowserPath) {
    if (getPlatform() === 'linux' && process.arch === 'arm64') {
      // Chrome is not available for arm64, use Chromium instead
      return await getChromiumPath()
    }

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
  const path = await getBrowserPath()
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

  const args = [
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
  ]

  // if we are on linux we spawn the browser directly and attach the on exit callback
  if (getPlatform() === 'linux') {
    const browserProc = spawn(path, args)

    browserProc.once('exit', handleBrowserClose)

    return browserProc
  }

  // macOS & windows
  return launch({
    executablePath: path,
    args: args,
    onExit: handleBrowserClose,
  })
}

function getChromiumPath(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec('which chromium', (error, stdout, stderr) => {
      if (error) {
        log.error(error)
        return reject(error)
      }
      if (stderr) {
        log.error(stderr)
        return reject(stderr)
      }

      return resolve(stdout.trim())
    })
  })
}
