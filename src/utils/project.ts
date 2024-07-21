import { app } from 'electron'
import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'

export const PROJECT_PATH = path.join(app.getPath('documents'), 'k6-studio')
export const RECORDINGS_PATH = path.join(PROJECT_PATH, 'Recordings')
export const GENERATORS_PATH = path.join(PROJECT_PATH, 'Generators')
export const SCRIPTS_PATH = path.join(PROJECT_PATH, 'Scripts')

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
