import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'

import { verifyDocumentsAccess } from '@/main/permissions'

import {
  DATA_FILES_PATH,
  PROJECT_PATH,
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
  TEMP_PATH,
} from '../constants/workspace'

export const setupProjectStructure = async () => {
  const hasAccess = await verifyDocumentsAccess()
  if (!hasAccess) {
    throw new Error('Documents folder access denied')
  }

  if (!existsSync(PROJECT_PATH)) {
    await mkdir(PROJECT_PATH)
  }

  if (!existsSync(RECORDINGS_PATH)) {
    await mkdir(RECORDINGS_PATH)
  }

  if (!existsSync(GENERATORS_PATH)) {
    await mkdir(GENERATORS_PATH)
  }

  if (!existsSync(SCRIPTS_PATH)) {
    await mkdir(SCRIPTS_PATH)
  }

  if (!existsSync(TEMP_PATH)) {
    await mkdir(TEMP_PATH)
  }

  if (!existsSync(DATA_FILES_PATH)) {
    await mkdir(DATA_FILES_PATH)
  }
}

export function isExternalScript(scriptPath: string) {
  return path.dirname(scriptPath) !== path.normalize(SCRIPTS_PATH)
}
