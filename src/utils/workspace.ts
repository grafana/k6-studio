import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import {
  PROJECT_PATH,
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
} from '../constants/workspace'

export const setupProjectStructure = async () => {
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
}
