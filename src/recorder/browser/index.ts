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
}

declare global {
  interface Window {
    __K6_STUDIO_RECORDER_RUNTIME__?: RecorderRuntime
  }
}

// CDP injects this script into every frame, and injects it AGAIN into the
// same realm when a page replaces its document with document.open() (see the
// documentOpened handler in src/recorder/launchers/cdp/page.ts). The realm's
// long-lived pieces survive that replacement: the WebSocket connection, its
// keepalive timers, and the tab focus poll. Creating them anew on every
// re-injection would accumulate a connection and timers per document.open(),
// so they are created once per realm and reused. Everything per-document
// (the UI, the recording listeners) is genuinely destroyed with the old
// document and is set up again below.
const runtime = window.__K6_STUDIO_RECORDER_RUNTIME__
const isReinjection = runtime !== undefined

const client = runtime?.client ?? createClient()
const storage = runtime?.storage ?? configureStorage(client)

window.__K6_STUDIO_RECORDER_RUNTIME__ = { client, storage }

// We capture events in all frames so that interactions inside iframes are
// recorded, but the recorder UI and tab focus tracking only make sense in the
// top frame. Child frames instead forward element inspection to the top
// frame's inspector.
if (isInFrame()) {
  attachInspectionDetection()
  attachTextSelectionDetection()
} else {
  if (!isReinjection) {
    trackTabFocus(client)
  }

  initializeView(client, storage)
}

startRecording(client, storage)
