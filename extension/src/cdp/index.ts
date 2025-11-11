import { startRecording } from '../frontend/recording'
import { initializeView } from '../frontend/view'

import { client } from './routing'
import { configureStorage } from './storage'
import { isInFrame } from './utils'
import { trackTabFocus } from './window'

// CDP will inject this script into all frames, but we only want to run it in the top frame.
if (!isInFrame()) {
  const storage = configureStorage(client)

  trackTabFocus(client)
  initializeView(client, storage)
  startRecording(client)
}
