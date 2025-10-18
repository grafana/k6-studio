import { startRecording } from './recording'
import { client } from './routing'
import { configureStorage } from './storage'
import { initializeView } from './view'

const storage = configureStorage()

initializeView(storage)
startRecording(client)
