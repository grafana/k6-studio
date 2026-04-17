import { LaunchBrowserOptions } from '@/recorder/types'

import { launchBrowserWithDevToolsProtocol } from './launchers/cdp'
import { launchBrowserWithHttpOnly } from './launchers/http'
import { RecordingSession } from './launchers/types'

/**
 * Starts a browser instance for recording. Throws if the browser fails to start.
 * Runtime errors during the recording session are emitted via events on the
 * `RecordingSession` instance.
 */
export async function launchBrowser(
  args: LaunchBrowserOptions
): Promise<RecordingSession> {
  if (args.capture.browser) {
    return launchBrowserWithDevToolsProtocol('pipe', args.url)
  }

  return launchBrowserWithHttpOnly(args.url)
}
