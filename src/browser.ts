import { BrowserWindow } from 'electron'
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

export const launchBrowser = async (
  browserWindow: BrowserWindow,
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

  const sendBrowserClosedEvent = (): Promise<void> => {
    // we send the browser:stopped event when the browser is closed
    // NOTE: on macos pressing the X button does not close the application so it won't be fired
    browserWindow.webContents.send('browser:closed')
    return Promise.resolve()
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
      disableChromeOptimizations,
      url?.trim() || 'about:blank',
    ],
    onExit: sendBrowserClosedEvent,
  })
}
