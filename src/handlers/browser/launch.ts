import { RecorderSettings } from '@/types/settings'
import { exhaustive } from '@/utils/typescript'

import { launchBrowserWithDevToolsProtocol } from './recorders/cdp'
import { launchBrowserWithExtension } from './recorders/extension'
import { launchBrowserWithHttpOnly } from './recorders/http'
import { RecordingSession } from './recorders/types'
import { LaunchBrowserOptions } from './types'

type LaunchBrowserArgs = LaunchBrowserOptions & { settings: RecorderSettings }

/**
 * Starts a browser instance for recording. Throws if the browser fails to start.
 * Runtime errors during the recording session are emitted via events on the
 * `RecordingSession` instance.
 */
export async function launchBrowser(
  args: LaunchBrowserArgs
): Promise<RecordingSession> {
  if (args.capture.browser) {
    return launchWithBrowserRecording(args)
  }

  return launchBrowserWithHttpOnly(args.url)
}

function launchWithBrowserRecording({ url, settings }: LaunchBrowserArgs) {
  switch (settings.browserRecording) {
    case 'extension':
      return launchBrowserWithExtension(url)

    case 'cdp':
      return launchBrowserWithDevToolsProtocol('pipe', url)

    case 'disabled':
      return launchBrowserWithHttpOnly(url)

    default:
      return exhaustive(settings.browserRecording)
  }
}
