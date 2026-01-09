import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'

import {
  DATA_FILES_PATH,
  PROJECT_PATH,
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
  TEMP_PATH,
  BROWSER_TESTS_PATH,
} from '../constants/workspace'

const REQUIRED_FOLDERS = [
  PROJECT_PATH,
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
  TEMP_PATH,
  DATA_FILES_PATH,
  BROWSER_TESTS_PATH,
]

export const setupProjectStructure = async () => {
  for (const folder of REQUIRED_FOLDERS) {
    if (!existsSync(folder)) {
      await mkdir(folder)
    }
  }
}

export function isExternalScript(scriptPath: string) {
  return path.dirname(scriptPath) !== path.normalize(SCRIPTS_PATH)
}
