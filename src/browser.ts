import {
  computeSystemExecutablePath,
  Browser,
  ChromeReleaseChannel,
  launch,
} from '@puppeteer/browsers'
import { exec, spawn } from 'child_process'
import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { mkdtemp } from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'

import { BrowserHandler } from './handlers/browser/types'
import { appSettings } from './main'
import { getCertificateSPKI } from './proxy'
import { BrowserServer } from './services/browser/server'
import { getPlatform } from './utils/electron'

const createUserDataDir = async () => {
  return mkdtemp(path.join(os.tmpdir(), 'k6-studio-'))
}

export async function getBrowserPath() {
  const { recorder } = appSettings

  if (!recorder.detectBrowserPath) {
    return recorder.browserPath || ''
  }

  const chromePath = getChromePath()
  if (chromePath) {
    return chromePath
  }

  const chromiumPath = await getChromiumPath()
  if (chromiumPath) {
    return chromiumPath
  }

  throw new Error('Could not detect Chrome or Chromium browser')
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

  const handleBrowserClose = (): Promise<void> => {
    browserServer.stop()

    // we send the browser:stopped event when the browser is closed
    // NOTE: on macos pressing the X button does not close the application so it won't be fired
    browserWindow.webContents.send(BrowserHandler.Closed)

    return Promise.resolve()
  }

  const handleBrowserLaunchError = (error: Error) => {
    log.error(error)
    browserServer.stop()
    browserWindow.webContents.send(BrowserHandler.Failed)
  }

  const browserRecordingArgs = appSettings.recorder.enableBrowserRecorder
    ? [`--load-extension=${extensionPath}`]
    : []

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
    ...browserRecordingArgs,
    disableChromeOptimizations,
    url?.trim() || 'about:blank',
  ]

  // if we are on linux we spawn the browser directly and attach the on exit callback
  if (getPlatform() === 'linux') {
    const browserProc = spawn(path, args)

    browserProc.on('error', handleBrowserLaunchError)
    browserProc.once('exit', handleBrowserClose)
    return browserProc
  }

  // macOS & windows
  const browserProc = launch({
    executablePath: path,
    args: args,
    onExit: handleBrowserClose,
  })
  browserProc.nodeProcess.on('error', handleBrowserLaunchError)
  return browserProc
}

function getChromePath() {
  try {
    return computeSystemExecutablePath({
      browser: Browser.CHROME,
      channel: ChromeReleaseChannel.STABLE,
    })
  } catch (e) {
    log.error(e)
    return undefined
  }
}

async function getChromiumPath() {
  try {
    // on Windows, the Chromium executable is called `chrome.exe`
    const command =
      getPlatform() === 'win' ? 'where chrome' : 'command -v chromium'

    const { stdout, stderr } = await promisify(exec)(command)

    if (stderr) {
      log.error(stderr)
      return undefined
    }

    return stdout.trim()
  } catch (error) {
    log.error(error)
    return undefined
  }
}
