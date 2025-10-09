import { initializeFrontendRecorder } from '../core/frontend'
import { setupFrontendRouting } from '../core/routing'
import { BackgroundTransport } from '../messaging/transports/background'

import { initializeView } from './view'

const client = setupFrontendRouting(new BackgroundTransport('recorder'))

initializeFrontendRecorder(client)
initializeView(client)
