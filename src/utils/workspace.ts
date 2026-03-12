import { FSWatcher, watch } from 'chokidar'
import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import { isMatch } from 'micromatch'
import path from 'path'

// import { EventEmitter } from 'extension/src/utils/events'

import { EventEmitter } from 'extension/src/utils/events'

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

interface WorkspaceEventMap {
  'file:add': { path: string }
  'file:remove': { path: string }
  'file:change': { path: string }
  'workspace:change': { path: string }
}

export class Workspace extends EventEmitter<WorkspaceEventMap> {
  #rootPath: string
  #watcher: FSWatcher

  constructor(rootPath: string) {
    super()

    this.#rootPath = rootPath
    this.#watcher = watch(rootPath, {
      ignoreInitial: true,
      ignored: (path) => {
        return isMatch(path, [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/out/**',
          '**/target/**',
          '**/tmp/**',
          '**/temp/**',
          '**/cache/**',
          '**/logs/**',
        ])
      },
    })
  }

  switch(newRootPath: string) {
    this.#watcher.unwatch(this.#rootPath)

    this.#rootPath = newRootPath
    this.#watcher.add(newRootPath)

    this.emit('workspace:change', {
      path: newRootPath,
    })
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

  async close() {
    await this.#watcher.close()
  }
}
