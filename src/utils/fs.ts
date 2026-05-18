/* eslint-disable no-restricted-imports */
import {
  FSWatcher as ChokidarFSWatcher,
  ChokidarOptions,
  watch as chokidarWatch,
} from 'chokidar'
import {
  BrowserWindow,
  dialog,
  OpenDialogOptions,
  OpenDialogReturnValue,
  SaveDialogOptions,
  SaveDialogReturnValue,
} from 'electron'
import { PathLike } from 'fs'
import { access, writeFile } from 'fs/promises'
import * as fs from 'fs/promises'

import { EventEmitter } from './events'
import * as path from './path'
import { normalize } from './path'
import { isNodeJsErrnoException } from './typescript'

export { createWriteStream } from 'fs'
export {
  copyFile,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from 'fs/promises'

export async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

export async function mkdir(
  path: PathLike,
  options?: Parameters<typeof fs.mkdir>[1]
): Promise<string | undefined> {
  const created = await fs.mkdir(path, options)

  if (created === undefined) {
    return undefined
  }

  return normalize(created)
}

export async function mkdtemp(prefix: string): Promise<string> {
  return normalize(await fs.mkdtemp(prefix))
}

export async function readdir(path: PathLike) {
  const entries = await fs.readdir(path, { withFileTypes: true })

  for (const entry of entries) {
    entry.parentPath = normalize(entry.parentPath)
  }

  return entries
}

export async function createFileWithUniqueName({
  directory,
  data,
  prefix,
  ext,
}: {
  directory: string
  data: string
  prefix: string
  ext: string
}): Promise<string> {
  const timestamp = new Date().toISOString().split('T')[0] ?? ''
  const template = `${prefix ? `${prefix} - ` : ''}${timestamp}${ext}`

  // Start from 2 as it follows the the OS behavior for duplicate files
  let fileVersion = 2
  let uniqueFileName = template
  let fileCreated = false

  do {
    try {
      // ax+ flag will throw an error if the file already exists
      await writeFile(path.join(directory, uniqueFileName), data, {
        flag: 'ax+',
      })
      fileCreated = true
    } catch (error) {
      if (isNodeJsErrnoException(error) && error.code !== 'EEXIST') {
        throw error
      }

      const { name, ext } = path.parse(template)
      uniqueFileName = `${name} (${fileVersion})${ext}`
      fileVersion++
    }
  } while (!fileCreated)

  return normalize(path.join(directory, uniqueFileName))
}

interface FSWatcherEventMap {
  add: string
  change: string
  unlink: string
}

/**
 * Proxy over chokidar's FSWatcher that normalizes emitted paths to POSIX
 * separators via pathe.
 */
export class FSWatcher extends EventEmitter<FSWatcherEventMap> {
  #watcher: ChokidarFSWatcher

  constructor(paths: string | string[], options?: ChokidarOptions) {
    super()

    this.#watcher = chokidarWatch(paths, options)

    this.#watcher.on('add', (path) => this.emit('add', normalize(path)))
    this.#watcher.on('change', (path) => this.emit('change', normalize(path)))
    this.#watcher.on('unlink', (path) => this.emit('unlink', normalize(path)))
  }

  add(paths: string | string[]): this {
    this.#watcher.add(paths)
    return this
  }

  unwatch(paths: string | string[]): this {
    this.#watcher.unwatch(paths)
    return this
  }

  close(): Promise<void> {
    return this.#watcher.close()
  }
}

export function watch(
  paths: string | string[],
  options?: ChokidarOptions
): FSWatcher {
  return new FSWatcher(paths, options)
}

type ExtendedOpenDialogOptions = OpenDialogOptions & {
  useNativePaths?: boolean
}

export async function showOpenDialog(
  browserWindow: BrowserWindow,
  { useNativePaths = false, ...dialogOptions }: ExtendedOpenDialogOptions
): Promise<OpenDialogReturnValue> {
  const result = await dialog.showOpenDialog(browserWindow, dialogOptions)

  if (useNativePaths) {
    return result
  }

  return {
    ...result,
    filePaths: result.filePaths.map(normalize),
  }
}

export async function showSaveDialog(
  browserWindow: BrowserWindow,
  options: SaveDialogOptions
): Promise<SaveDialogReturnValue> {
  const result = await dialog.showSaveDialog(browserWindow, options)

  return {
    ...result,
    filePath: result.filePath ? normalize(result.filePath) : result.filePath,
  }
}
