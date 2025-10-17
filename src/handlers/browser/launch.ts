import {
  computeSystemExecutablePath,
  Browser,
  ChromeReleaseChannel,
} from '@puppeteer/browsers'
import { ChildProcess, exec, spawn } from 'child_process'
import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { readFile, mkdir, mkdtemp, writeFile } from 'fs/promises'
import os from 'os'
import path, { join } from 'path'
import { promisify } from 'util'

import { getProxyArguments } from '@/main/proxy'
import { RecorderSettings } from '@/types/settings'
import { ChromeDevtoolsClient } from '@/utils/cdp/client'
import { getResourcesPath } from '@/utils/resources'
import { uuid } from '@/utils/uuid'
import { WebSocketServerError } from 'extension/src/core/clients/messaging/transports/webSocketServer'

import { BrowserServer } from '../../services/browser/server'
import { getPlatform } from '../../utils/electron'

import { BrowserHandler, LaunchBrowserOptions } from './types'

const CHROME_DEV_PREFERENCES = JSON.stringify({
  devtools: {
    preferences: {
      currentDockState: '"undocked"',
      'navigator-view-selected-tab': '"navigator-content-scripts"',
      'panel-selected-tab': '"sources"',
    },
    synced_preferences_sync_disabled: {
      // This allows content scripts to be debugged via DevTools without
      // having to whitelist them yourself.
      'skip-content-scripts': 'false',
    },
  },
})

const createUserDataDir = async () => {
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'k6-studio-'))

  // If we're in development mode, we create a default Chrome profile
  // with some preferences that make developing the extension easier
  // (e.g. whitelisting content scripts in the debugger).
  //
  // @ts-expect-error - Electron apps are built as CJS.
  if (import.meta.env.DEV) {
    try {
      const defaultProfilePath = path.join(userDataDir, 'Default')
      const preferencesPath = path.join(defaultProfilePath, 'Preferences')

      await mkdir(defaultProfilePath, { recursive: true })
      await writeFile(preferencesPath, CHROME_DEV_PREFERENCES, 'utf8')
    } catch (error) {
      console.error('Error creating Chrome profile:', error)
    }
  }

  return userDataDir
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

const EXTENSION_RECORDER_ARGS = [
  '--remote-debugging-pipe',
  '--enable-unsafe-extension-debugging',
]

const REMOTE_DEBUGGING_PORT = 9222

const REMOTE_RECORDER_ARGS = [
  `--remote-debugging-port=${REMOTE_DEBUGGING_PORT}`,
]

function getBrowserRecordingArgs({
  useExperimentalRemoteDebugging: useRemoteDebugging,
}: RecorderSettings) {
  return useRemoteDebugging ? REMOTE_RECORDER_ARGS : EXTENSION_RECORDER_ARGS
}

export const launchBrowser = async (
  settings: RecorderSettings,
  browserWindow: BrowserWindow,
  browserServer: BrowserServer,
  { url, capture }: LaunchBrowserOptions
) => {
  const path = await getBrowserPath()
  console.info(`browser path: ${path}`)

  const userDataDir = await createUserDataDir()
  console.log(userDataDir)

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
    browserWindow.webContents.send(BrowserHandler.Error, {
      reason: 'browser-launch',
      fatal: true,
    })
  }

  const proxyArgs = await getProxyArguments(k6StudioState.appSettings.proxy)

  const browserRecordingArgs = capture.browser
    ? getBrowserRecordingArgs(settings)
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
    `--disable-features=${FEATURES_TO_DISABLE.join(',')}`,
    ...proxyArgs,
    ...browserRecordingArgs,
    url?.trim() || 'about:blank',
  ]

  if (capture.browser) {
    try {
      await browserServer.start(browserWindow)

      const process = await new Promise<ChildProcess>((resolve, reject) => {
        const process = spawn(path, args, {
          stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
        })

        process.on('spawn', () => {
          resolve(process)
        })

        process.on('error', (err) => {
          reject(err)
        })
      })

      try {
        await startBrowserRecording(process, settings)
      } catch (error) {
        // If we fail to load the extension, we'll log the error and continue without it.
        log.error('Failed to start browser recording: ', error)

        browserWindow.webContents.send(BrowserHandler.Error, {
          reason: 'extension-load',
          fatal: false,
        })
      }

      process.once('exit', handleBrowserClose)

      return process
    } catch (error) {
      log.error('An error occurred while starting recording: ', error)

      browserServer.stop()

      browserWindow.webContents.send(BrowserHandler.Error, {
        fatal: true,
        reason:
          error instanceof WebSocketServerError
            ? 'websocket-server-error'
            : 'browser-launch',
      })

      return null
    }
  }

  const process = spawn(path, args, {
    stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
  })

  process.on('error', handleBrowserLaunchError)
  process.once('exit', handleBrowserClose)

  return process
}

async function loadExtensionRecorder(process: ChildProcess) {
  const extensionPath = getExtensionPath()

  console.info(`extension path: ${extensionPath}`)

  const client = ChromeDevtoolsClient.fromChildProcess(process)

  const response = await client.call('Extensions.loadUnpacked', {
    path: extensionPath,
  })

  log.log(`k6 Studio extension loaded`, response)
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

function startBrowserRecording(
  process: ChildProcess,
  settings: RecorderSettings
) {
  if (settings.useExperimentalRemoteDebugging) {
    return startRemoteBrowserRecording()
  }

  return loadExtensionRecorder(process)
}

async function startRemoteBrowserRecording() {
  const baseUrl = `http://localhost:${REMOTE_DEBUGGING_PORT}`

  const frontendScript = await readFile(
    join(getResourcesPath(), 'browser', 'frontend.js'),
    { encoding: 'utf8' }
  )

  const browser = await ChromeDevtoolsClient.discoverWebSocket(baseUrl)

  browser.on('Target.attachedToTarget', async (event) => {
    const tabId = uuid()

    const page = await ChromeDevtoolsClient.connectToWebSocket(
      new URL(`/devtools/page/${event.targetInfo.targetId}`, baseUrl).toString()
    )

    page.on('Page.frameNavigated', (event) => {
      console.log('navigated', event.frame.url)
    })

    await page.call('Page.enable', {})

    await page.call('Page.addScriptToEvaluateOnNewDocument', {
      source: `window.__K6_STUDIO_TAB_ID__ = '${tabId}';`,
      runImmediately: true,
    })

    await page.call('Page.addScriptToEvaluateOnNewDocument', {
      source: frontendScript,
      runImmediately: true,
    })
  })

  await browser.call('Target.setAutoAttach', {
    autoAttach: true,
    waitForDebuggerOnStart: false,
    flatten: true,
    filter: [{ type: 'page', exclude: false }, { exclude: true }],
  })
}
