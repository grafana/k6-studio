import {
  computeSystemExecutablePath,
  Browser,
  ChromeReleaseChannel,
} from '@puppeteer/browsers'
import { exec } from 'child_process'
import log from 'electron-log/main'
import { promisify } from 'util'

import { RecorderSettings } from '@/types/settings'

import { getPlatform } from './electron'

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

export async function getBrowserPath(settings: RecorderSettings) {
  if (!settings.detectBrowserPath) {
    return settings.browserPath || ''
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
