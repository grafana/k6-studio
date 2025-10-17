import { BrowserWindow } from 'electron'

import { BrowserServer } from '../../services/browser/server'

import { launchBrowserWithExtension } from './recorders/extension'
import { launchBrowserWithHttpOnly } from './recorders/http'
import { RecordingSession } from './recorders/types'
import { LaunchBrowserOptions } from './types'

/**
 * Starts a browser instance for recording. Throws if the browser fails to start.
 * Runtime errors during the recording session are emitted via events on the
 * `RecordingSession` instance.
 */
export const launchBrowser = async (
  browserWindow: BrowserWindow,
  browserServer: BrowserServer,
  { url, capture }: LaunchBrowserOptions
): Promise<RecordingSession> => {
  if (capture.browser) {
    return launchBrowserWithExtension(browserWindow, browserServer, url)
  }

  return launchBrowserWithHttpOnly(url)
}
