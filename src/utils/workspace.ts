import { parse as parseTOML } from '@iarna/toml'
import { FSWatcher, watch } from 'chokidar'
import { existsSync } from 'fs'
import { mkdir, readFile } from 'fs/promises'
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
import { addToRecentDocuments } from '../main/menu'
import {
  WorkspaceConfigFile,
  WorkspaceConfigSchema,
  type WorkspaceConfig,
} from '../schemas/workspace'

const REQUIRED_FOLDERS = [
  PROJECT_PATH,
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
  TEMP_PATH,
  DATA_FILES_PATH,
  BROWSER_TESTS_PATH,
]

const K6_TOML = 'k6.toml'

const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfig = {
  files: { include: [], exclude: [] },
  cloud: {
    project_id: null,
  },
}

function deepMergeConfig(
  base: WorkspaceConfig,
  override: WorkspaceConfigFile
): WorkspaceConfig {
  const files = { ...base.files, ...override.files }
  const cloud = { ...base.cloud, ...override.cloud }

  return {
    files,
    cloud,
  }
}

async function discoverConfigFiles(workspaceRoot: string) {
  const configFiles: WorkspaceConfigFile[] = []

  let dir = path.resolve(workspaceRoot)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const configPath = path.join(dir, K6_TOML)

    try {
      const raw = await readFile(configPath, 'utf-8')
      const parsed = parseTOML(raw)

      const validated = WorkspaceConfigSchema.parse(parsed)

      configFiles.push(validated)
    } catch {
      // File does not exist or isn't a valid TOML file, continue to the parent directory
    }

    const parent = path.dirname(dir)

    // `path.dirname` will return the same path if the path is the root.
    if (parent === dir) {
      break
    }

    dir = path.dirname(dir)
  }

  return configFiles.reverse()
}

async function loadWorkspaceConfig(
  workspaceRoot: string
): Promise<WorkspaceConfig> {
  const configFiles = await discoverConfigFiles(workspaceRoot)

  return configFiles.reduce(deepMergeConfig, DEFAULT_WORKSPACE_CONFIG)
}

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
  static async create(rootPath: string) {
    const config = await loadWorkspaceConfig(rootPath)

    return new Workspace(rootPath, config)
  }

  #rootPath: string
  #watcher: FSWatcher
  #config: WorkspaceConfig

  constructor(rootPath: string, config: WorkspaceConfig) {
    super()

    this.#rootPath = rootPath
    this.#config = config

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

  async switch(newRootPath: string) {
    this.#watcher.unwatch(this.#rootPath)

    this.#rootPath = newRootPath
    this.#config = await loadWorkspaceConfig(newRootPath)
    this.#watcher.add(newRootPath)

    this.emit('workspace:change', {
      path: newRootPath,
    })

    addToRecentDocuments(newRootPath)
  }

  get path() {
    return this.#rootPath
  }

  get config() {
    return this.#config
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
