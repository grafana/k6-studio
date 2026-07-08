import { getElementDetails } from '@/utils/dom/selectors'

import { getOwnFramePath } from './frames'
import { FrameAgent, installFrameAgent } from './messaging/frames'
import { startRecording } from './recording'
import { client } from './routing'
import { configureStorage } from './storage'
import { isInFrame } from './utils'
import { initializeView } from './view'
import {
  attachInspectionDetection,
  attachTextSelectionDetection,
} from './view/inspection'
import { useInBrowserUIStore } from './view/store'
import { trackTabFocus } from './window'

// CDP injects this script into every frame. We capture events in all frames so
// that interactions inside iframes are recorded, but the recorder UI and tab
// focus tracking only make sense in the top frame. Same-origin child frames
// forward element inspection to the top frame's inspector; cross-origin frames
// coordinate over the frame agent's postMessage protocol instead.
const storage = configureStorage(client)

const agent = new FrameAgent({
  win: window,
  parentWindow: isInFrame() ? window.parent : null,
  getFrames: () =>
    [...document.querySelectorAll('iframe, frame')].flatMap((element) => {
      if (
        element instanceof HTMLIFrameElement ||
        element instanceof HTMLFrameElement
      ) {
        return [{ element, contentWindow: element.contentWindow }]
      }

      return []
    }),
  getIframeLocator: getElementDetails,
  getOwnPath: getOwnFramePath,
})

installFrameAgent(agent)

if (isInFrame()) {
  agent.announce()
  attachInspectionDetection()
  attachTextSelectionDetection()
} else {
  useInBrowserUIStore.subscribe((state, previous) => {
    const active = state.tool !== null
    const wasActive = previous.tool !== null

    if (active !== wasActive) {
      agent.broadcastToolState(active)
    }
  })

  trackTabFocus(client)
  initializeView(client, storage)
}

startRecording(client, storage)
