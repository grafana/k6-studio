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
import { proxyPort } from './main'

const createUserDataDir = async () => {
  return mkdtemp(path.join(os.tmpdir(), 'k6-studio-'))
}

export const launchBrowser = async () => {
  const path = computeSystemExecutablePath({
    browser: Browser.CHROME,
    channel: ChromeReleaseChannel.STABLE,
  })
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
      `--proxy-server=http://localhost:${proxyPort}`,
      `--ignore-certificate-errors-spki-list=${certificateSPKI}`,
      disableChromeOptimizations,
    ],
  })
}
