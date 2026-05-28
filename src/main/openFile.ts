import { app, BrowserWindow } from 'electron'

import { AppHandler } from '@/handlers/app/types'
import { getStudioFileFromPath } from '@/main/file'
import { getViewPath } from '@/routeMap'
import { normalize } from '@/utils/path'
import { addRecentFile } from '@/utils/recentFiles'

import { configureApplicationMenu } from './menu'

let pendingFilePath: string | null = null

export function initOpenFile() {
  // macOS: fires when a file is opened from Dock recent documents or Finder
  app.on('open-file', (event, filePath) => {
    event.preventDefault()

    handleOpenFile(filePath)
  })

  // Windows: fired on the first instance when a second instance tries to launch
  // with a file path argument (e.g. from the Jump List)
  app.on('second-instance', (_, argv) => {
    const filePath = findFilePathInArgs(argv)

    if (!filePath) {
      return
    }

    handleOpenFile(filePath)
  })

  // Windows: handle file path when the app is started fresh with a file argument
  const filePath = findFilePathInArgs(process.argv)

  if (filePath) {
    pendingFilePath = filePath
  }
}

export function replayPendingFileOpen() {
  if (pendingFilePath) {
    handleOpenFile(pendingFilePath)

    pendingFilePath = null
  }
}

function findFilePathInArgs(argv: string[]): string | null {
  // Skip the executable and the app entry point (first two args).
  // Ignore flags and protocol URLs — only consider plain file paths.
  const candidate = argv
    .slice(2)
    .find((arg) => !arg.startsWith('-') && !arg.includes('://'))

  if (!candidate) {
    return null
  }

  // Only treat it as a file path if it's a studio file we can open.
  return getStudioFileFromPath(candidate) ? candidate : null
}

function handleOpenFile(filePath: string) {
  try {
    const normalizedPath = normalize(filePath)
    const mainWindow = BrowserWindow.getAllWindows()[0]

    if (!mainWindow) {
      pendingFilePath = normalizedPath
      return
    }

    const file = getStudioFileFromPath(normalizedPath)

    if (!file) {
      return
    }

    addRecentFile(normalizedPath)
    configureApplicationMenu()

    mainWindow.webContents.send(
      AppHandler.Navigate,
      getViewPath(file.type, file.path)
    )

    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.focus()
  } catch (err) {
    console.error('Failed to open file:', err)
  }
}
