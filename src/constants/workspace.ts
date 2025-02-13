import { app } from 'electron'
import path from 'path'

export const PROJECT_PATH = path.join(app.getPath('documents'), 'k6-studio')
export const RECORDINGS_PATH = path.join(PROJECT_PATH, 'Recordings')
export const GENERATORS_PATH = path.join(PROJECT_PATH, 'Generators')
export const SCRIPTS_PATH = path.join(PROJECT_PATH, 'Scripts')
export const DATA_FILES_PATH = path.join(PROJECT_PATH, 'Data')

export const TEMP_PATH = path.join(app.getPath('temp'), 'k6-studio')
export const TEMP_SCRIPT_SUFFIX = '__tmp-k6studio__.js'
export const TEMP_K6_ARCHIVE_PATH = path.join(TEMP_PATH, 'k6-studio-test.tar')
export const TEMP_GENERATOR_SCRIPT_PATH = path.join(
  SCRIPTS_PATH,
  'k6-studio-generator-script' + TEMP_SCRIPT_SUFFIX
)
