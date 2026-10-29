import { getElementDetails } from '@/utils/dom/selectors'

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
import { attachToolState } from './view/toolState'
import { trackTabFocus } from './window'

export interface RecorderRuntime {
  client: BrowserExtensionClient
  storage: SettingsStorage
  describeElement: typeof getElementDetails
  disposeDocument: () => void
}

declare global {
  interface Window {
    // The runtime is injected in every iframe and whenever the document is replaced
    // using `document.open()`. This property holds the current runtime.
    __K6_STUDIO_RECORDER_RUNTIME__?: RecorderRuntime
    __K6_STUDIO_RECORD_FRAME_EVENTS__?: (events: string) => void
  }
}

const previous = window.__K6_STUDIO_RECORDER_RUNTIME__

previous?.disposeDocument()

// Connection and storage are not affected by document replacement, so reuse them if they exist.
const client = previous?.client ?? createClient()
const storage = previous?.storage ?? configureStorage(client)

const disposers: Array<() => void> = [attachToolState(client)]

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
  describeElement: getElementDetails,
  disposeDocument: () => {
    disposers.forEach((dispose) => dispose())
  },
}

// Resolve owners before a click can navigate away from this document.
window.__K6_STUDIO_RECORD_FRAME_EVENTS__?.('[]')
