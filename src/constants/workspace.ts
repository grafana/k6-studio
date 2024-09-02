import { app } from 'electron'
import path from 'path'

export const PROJECT_PATH = path.join(app.getPath('userData'), 'k6-studio')
export const RECORDINGS_PATH = path.join(PROJECT_PATH, 'Recordings')
export const GENERATORS_PATH = path.join(PROJECT_PATH, 'Generators')
export const SCRIPTS_PATH = path.join(PROJECT_PATH, 'Scripts')
