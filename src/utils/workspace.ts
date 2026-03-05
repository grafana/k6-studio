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

export class Workspace {
  #rootPath: string

  constructor(rootPath: string) {
    this.#rootPath = rootPath
  }

  switch(newRootPath: string) {
    this.#rootPath = newRootPath
  }

  get path() {
    return this.#rootPath
  }

  /**
   * @deprecated These hardcoded paths are deprecated and will be removed in the future.
   */
  get paths() {
    const rootPath = this.#rootPath

    return {
      get recordings() {
        return path.join(rootPath, 'Recordings')
      },
      get generators() {
        return path.join(rootPath, 'Generators')
      },
      get browserTests() {
        return path.join(rootPath, 'Browser')
      },
      get scripts() {
        return path.join(rootPath, 'Scripts')
      },
      get dataFiles() {
        return path.join(rootPath, 'Data')
      },
    }
  }

  isInside(path: string) {
    return path.startsWith(this.#rootPath)
  }

  close() {
    return Promise.resolve()
  }
}
