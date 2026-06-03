import { app } from 'electron'
import logger from 'electron-log/main'
import { z } from 'zod'

import { readFileSync, writeFile } from '@/utils/fs'

import * as path from './path'
import { normalize, toNativePath } from './path'

const MAX_RECENT_FILES = 10

const isMacOS = process.platform === 'darwin'
const RecentFilesSchema = z.array(z.string())

let recentFilesCache: string[] | null = null
let writeQueue: Promise<void> = Promise.resolve()

function getRecentFilesPath(): string {
  return path.join(normalize(app.getPath('userData')), 'recent-documents.json')
}

function loadRecentFile(): string[] {
  if (recentFilesCache !== null) {
    return recentFilesCache
  }

  try {
    const raw = readFileSync(getRecentFilesPath(), 'utf-8')

    recentFilesCache = RecentFilesSchema.parse(JSON.parse(raw))
  } catch {
    recentFilesCache = []
  }

  return recentFilesCache
}

function saveRecentFiles(files: string[]) {
  recentFilesCache = files

  writeQueue = writeQueue
    .then(() => writeFile(getRecentFilesPath(), JSON.stringify(files)))
    .catch(() => {
      logger.warn('Failed to save recent files list.')
    })
}

export function getRecentFiles(): string[] {
  // We only use the native recent documents feature on macOS, because:
  // - On Windows, the recent documents are shared across all application. To get per-app recent document,
  //   we would need to use the `app.setJumpList` API but it is a bit more complicated
  // - On Linux, there is no standard way to manage recent documents so `app.getRecentDocuments` is not supported.`
  if (isMacOS) {
    return app.getRecentDocuments().map(normalize)
  }

  return loadRecentFile()
}

export function addRecentFile(filePath: string) {
  if (isMacOS) {
    app.addRecentDocument(toNativePath(filePath))

    return
  }

  const files = loadRecentFile()
  const normalized = normalize(filePath)

  saveRecentFiles(
    [normalized, ...files.filter((f) => f !== normalized)].slice(
      0,
      MAX_RECENT_FILES
    )
  )

  return
}

export function clearRecentFiles() {
  if (isMacOS) {
    app.clearRecentDocuments()

    return
  }

  saveRecentFiles([])
}
