import { app } from 'electron'
import path from 'path'

export const PROJECT_PATH = path.join(app.getPath('documents'), 'k6-studio')
export const RECORDINGS_PATH = path.join(PROJECT_PATH, 'Recordings')
export const GENERATORS_PATH = path.join(PROJECT_PATH, 'Generators')
export const SCRIPTS_PATH = path.join(PROJECT_PATH, 'Scripts')
export const DATA_FILES_PATH = path.join(PROJECT_PATH, 'Data')

export const SCRIPTS_TEMP_PATH = path.join(app.getPath('temp'), 'Scripts')
export const DATA_FILES_TEMP_PATH = path.join(app.getPath('temp'), 'Data')
