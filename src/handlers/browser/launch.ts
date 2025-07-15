import {
  computeSystemExecutablePath,
  Browser,
  ChromeReleaseChannel,
} from '@puppeteer/browsers'
import { exec, spawn } from 'child_process'
import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { mkdtemp } from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'

import { getCertificateSPKI } from '@/main/proxy'
import { ChromeDevtoolsClient } from '@/utils/cdp/client'

import { BrowserServer } from '../../services/browser/server'
import { getPlatform } from '../../utils/electron'

import { BrowserHandler, LaunchBrowserOptions } from './types'

const createUserDataDir = async () => {
  return mkdtemp(path.join(os.tmpdir(), 'k6-studio-'))
}

export async function getBrowserPath() {
  const { recorder } = k6StudioState.appSettings

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

const FEATURES_TO_DISABLE = [
  'OptimizationGuideModelDownloading',
  'OptimizationHintsFetching',
  'OptimizationTargetPrediction',
  'OptimizationHints',
]

const BROWSER_RECORDING_ARGS = [
  '--remote-debugging-pipe',
  '--enable-unsafe-extension-debugging',
]

export const launchBrowser = async (
  browserWindow: BrowserWindow,
  browserServer: BrowserServer,
  { url, capture }: LaunchBrowserOptions
) => {
  const path = await getBrowserPath()
  console.info(`browser path: ${path}`)

  const userDataDir = await createUserDataDir()
  console.log(userDataDir)
  const certificateSPKI = await getCertificateSPKI()

  const extensionPath = getExtensionPath()
  console.info(`extension path: ${extensionPath}`)

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

  const browserRecordingArgs = capture.browser ? BROWSER_RECORDING_ARGS : []

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
    `--proxy-server=http://localhost:${k6StudioState.appSettings.proxy.port}`,
    `--ignore-certificate-errors-spki-list=${certificateSPKI}`,
    `--disable-features=${FEATURES_TO_DISABLE.join(',')}`,
    ...browserRecordingArgs,
    url?.trim() || 'about:blank',
  ]

  const process = spawn(path, args, {
    stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
  })

  if (capture.browser) {
    try {
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          process.on('spawn', resolve)
          process.on('error', reject)
        }),
        browserServer.start(browserWindow),
      ])

      const client = ChromeDevtoolsClient.fromChildProcess(process)

      const response = await client.call({
        method: 'Extensions.loadUnpacked',
        params: {
          path: extensionPath,
        },
      })

      log.log(`k6 Studio extension loaded`, response)
    } catch (error) {
      // If we fail to start browser recording, we'll log the error
      // and continue without it.
      log.error('Failed to start browser recording:', error)
    }
  }

  process.on('error', handleBrowserLaunchError)
  process.once('exit', handleBrowserClose)

  return process
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
