import { BrowserWindow } from 'electron'

import { BrowserServer } from '../../services/browser/server'

import { launchBrowserWithExtension } from './recorders/extension'
import { launchBrowserWithHttpOnly } from './recorders/http'
import { RecordingSession } from './recorders/types'
import { LaunchBrowserOptions } from './types'

export const launchBrowser = async (
  browserWindow: BrowserWindow,
  browserServer: BrowserServer,
  { url, capture }: LaunchBrowserOptions
): Promise<RecordingSession | null> => {
  if (capture.browser) {
    return launchBrowserWithExtension(browserWindow, browserServer, url)
  }

  return launchBrowserWithHttpOnly(browserWindow, url)
}
