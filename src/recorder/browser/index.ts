import { BrowserExtensionClient } from './messaging'
import { startRecording } from './recording'
import { createClient } from './routing'
import { configureStorage } from './storage'
import { isInFrame } from './utils'
import { initializeView } from './view'
import {
  attachInspectionDetection,
  attachTextSelectionDetection,
} from './view/inspection'
import { SettingsStorage } from './view/SettingsProvider'
import { trackTabFocus } from './window'

export interface RecorderRuntime {
  client: BrowserExtensionClient
  storage: SettingsStorage

  /**
   * Tears down the per-document setup of the copy that created this runtime:
   * recording listeners, the UI's React tree, and focus tracking.
   */
  disposeDocument: () => void
}

declare global {
  interface Window {
    __K6_STUDIO_RECORDER_RUNTIME__?: RecorderRuntime
  }
}

// CDP injects this script into every frame, and injects it AGAIN into the
// same realm when a page replaces its document with document.open() (see the
// documentOpened handler in src/recorder/launchers/cdp/page.ts). The realm's
// long-lived pieces survive that replacement: the WebSocket connection and
// its keepalive timers. Creating them anew on every re-injection would
// accumulate a connection per document.open(), so they are created once per
// realm and reused.
//
// Everything per-document is disposed and set up again: document.open()
// erases the previous copy's window listeners, but when two copies race into
// the SAME document (e.g. two rapid document.open() calls whose re-injections
// both land after the last one), the earlier copy's listeners are still live
// and every interaction would be recorded twice. The previous copy's React
// tree also stays subscribed to the reused client until unmounted.
const previous = window.__K6_STUDIO_RECORDER_RUNTIME__

previous?.disposeDocument()

const client = previous?.client ?? createClient()
const storage = previous?.storage ?? configureStorage(client)

const disposers: Array<() => void> = []

// We capture events in all frames so that interactions inside iframes are
// recorded, but the recorder UI and tab focus tracking only make sense in the
// top frame. Child frames instead forward element inspection to the top
// frame's inspector.
if (isInFrame()) {
  disposers.push(attachInspectionDetection())
  disposers.push(attachTextSelectionDetection())
} else {
  disposers.push(trackTabFocus(client))
  disposers.push(initializeView(client, storage))
}

disposers.push(startRecording(client, storage))

window.__K6_STUDIO_RECORDER_RUNTIME__ = {
  client,
  storage,
  disposeDocument: () => {
    disposers.forEach((dispose) => dispose())
  },
}
