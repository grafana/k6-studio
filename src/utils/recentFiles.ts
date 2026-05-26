import { app } from 'electron'
import logger from 'electron-log'
import { z } from 'zod'

import { readFileSync, writeFile } from '@/utils/fs'

import * as path from './path'
import { normalize, toNativePath } from './path'

const MAX_RECENT_FILES = 10

const isLinux = process.platform === 'linux'
const RecentFilesSchema = z.array(z.string())

let linuxRecentFilesCache: string[] | null = null
let linuxWritePromise: Promise<void> = Promise.resolve()

function getLinuxRecentFilesPath(): string {
  return path.join(normalize(app.getPath('userData')), 'recent-documents.json')
}

function loadLinuxRecentFiles(): string[] {
  if (linuxRecentFilesCache !== null) {
    return linuxRecentFilesCache
  }

  try {
    const raw = readFileSync(getLinuxRecentFilesPath(), 'utf-8')

    linuxRecentFilesCache = RecentFilesSchema.parse(JSON.parse(raw))
  } catch {
    linuxRecentFilesCache = []
  }

  return linuxRecentFilesCache
}

function saveLinuxRecentFiles(files: string[]) {
  linuxRecentFilesCache = files

  linuxWritePromise = linuxWritePromise
    .then(() => writeFile(getLinuxRecentFilesPath(), JSON.stringify(files)))
    .catch(() => {
      logger.warn('Failed to save recent files list.')
    })
}

export function getRecentFiles(): string[] {
  if (isLinux) {
    return loadLinuxRecentFiles()
  }

  return app.getRecentDocuments().map(normalize)
}

export function addRecentFile(filePath: string) {
  if (isLinux) {
    const files = loadLinuxRecentFiles()
    const normalized = normalize(filePath)

    saveLinuxRecentFiles(
      [normalized, ...files.filter((f) => f !== normalized)].slice(
        0,
        MAX_RECENT_FILES
      )
    )

    return
  }

  app.addRecentDocument(toNativePath(filePath))
}

export function clearRecentFiles() {
  if (isLinux) {
    saveLinuxRecentFiles([])

    return
  }

  app.clearRecentDocuments()
}
