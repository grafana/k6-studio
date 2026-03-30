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

function normalizeRootPath(rootPath: string) {
  const normalized = path.normalize(rootPath)

  // Strip trailing sep except for the filesystem root (`/` or `C:\`), where that
  // would yield an empty or ambiguous path.
  if (normalized.endsWith(path.sep) && normalized.length > path.sep.length) {
    return normalized.slice(0, -1)
  }

  return normalized
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

    this.#rootPath = normalizeRootPath(rootPath)
    this.#config = config

    this.#watcher = watch(this.#rootPath, {
      ignoreInitial: true,
      ignored: (targetPath) => {
        return isMatch(targetPath, [
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

    const emitFsEvent = (
      type: 'file:add' | 'file:remove' | 'file:change',
      filePath: string
    ) => {
      const normalized = path.normalize(filePath)
      const rootPrefix = this.#rootPath + path.sep

      if (normalized !== this.#rootPath && !normalized.startsWith(rootPrefix)) {
        return
      }

      this.emit(type, { path: normalized })
    }

    this.#watcher.on('add', (filePath) => {
      emitFsEvent('file:add', filePath)
    })

    this.#watcher.on('addDir', (dirPath) => {
      emitFsEvent('file:add', dirPath)
    })

    this.#watcher.on('unlink', (filePath) => {
      emitFsEvent('file:remove', filePath)
    })

    this.#watcher.on('unlinkDir', (dirPath) => {
      emitFsEvent('file:remove', dirPath)
    })

    this.#watcher.on('change', (filePath) => {
      emitFsEvent('file:change', filePath)
    })
  }

  async switch(newRootPath: string) {
    this.#watcher.unwatch(this.#rootPath)

    this.#rootPath = normalizeRootPath(newRootPath)

    this.#config = await loadWorkspaceConfig(this.#rootPath)
    this.#watcher.add(this.#rootPath)

    this.emit('workspace:change', {
      path: this.#rootPath,
    })

    addToRecentDocuments(this.#rootPath)
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

  isInside(candidatePath: string) {
    const normalized = path.normalize(candidatePath)
    const root = this.#rootPath

    return normalized === root || normalized.startsWith(root + path.sep)
  }

  async close() {
    await this.#watcher.close()
  }
}
