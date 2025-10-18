import { startRecording } from '../frontend/recording'
import { initializeView } from '../frontend/view'

import { client } from './routing'
import { configureStorage } from './storage'

const storage = configureStorage()

initializeView(client, storage)
startRecording(client)
