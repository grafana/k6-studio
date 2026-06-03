import {
  DATA_FILES_PATH,
  PROJECT_PATH,
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
  TEMP_PATH,
  BROWSER_TESTS_PATH,
} from '../constants/workspace'

import { mkdir } from './fs'
import * as path from './path'

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
    await mkdir(folder, { recursive: true })
  }
}

export function isExternalScript(scriptPath: string) {
  return !path.equal(path.dirname(scriptPath), SCRIPTS_PATH)
}

export function isExternalRecording(recordingPath: string) {
  return !path.equal(path.dirname(recordingPath), RECORDINGS_PATH)
}

export function isExternalGenerator(filePath: string) {
  return !path.equal(path.dirname(filePath), GENERATORS_PATH)
}

export function isExternalBrowserTest(filePath: string) {
  return !path.equal(path.dirname(filePath), BROWSER_TESTS_PATH)
}

export function isExternalDataFile(filePath: string) {
  return !path.equal(path.dirname(filePath), DATA_FILES_PATH)
}
