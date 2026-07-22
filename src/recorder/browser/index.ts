import { startRecording } from './recording'
import { client } from './routing'
import { configureStorage } from './storage'
import { isInFrame } from './utils'
import { initializeView } from './view'
import {
  attachInspectionDetection,
  attachTextSelectionDetection,
} from './view/inspection'
import { trackTabFocus } from './window'

// CDP injects this script into every frame. We capture events in all frames so
// that interactions inside iframes are recorded, but the recorder UI and tab
// focus tracking only make sense in the top frame. Child frames instead forward
// element inspection to the top frame's inspector.
const storage = configureStorage(client)

if (isInFrame()) {
  attachInspectionDetection()
  attachTextSelectionDetection()
} else {
  trackTabFocus(client)
  initializeView(client, storage)
}

startRecording(client, storage)
