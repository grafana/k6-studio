import log from 'electron-log/main'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { FSWatcher, watch } from 'chokidar'
import { BrowserWindow } from 'electron'
import fs from 'fs/promises'
import { getPlatform } from './utils/electron'

let watcher: FSWatcher

export function initializeLogger() {
  // allow logs to be triggered from the renderer process
  // https://github.com/megahertz/electron-log/blob/master/docs/initialize.md
  log.initialize()

  // log electron core events
  // https://github.com/megahertz/electron-log/blob/master/docs/events.md
  log.eventLogger.startLogging()

  // log uncaught exceptions
  // https://github.com/megahertz/electron-log/blob/master/docs/errors.md
  log.errorHandler.startCatching()

  log.transports.file.fileName = 'k6-studio.log'
  if (process.env.NODE_ENV === 'development') {
    log.transports.file.fileName = 'k6-studio-dev.log'
  }

  // initialize chokidar watcher to watch log file
  watcher = watch(log.transports.file.getFile().path)
  watcher.on('change', onLogChange)
}

export function openLogFolder() {
  const logFile = log.transports.file.getFile().path
  const logPath = path.dirname(logFile)

  // supports only Mac and Windows at this time
  const executable = ['mac', 'linux'].includes(getPlatform())
    ? 'open'
    : 'explorer'
  spawn(executable, [logPath])
}

export async function getLogContent() {
  const path = log.transports.file.getFile().path
  return await fs.readFile(path, 'utf8')
}

async function onLogChange() {
  const content = await getLogContent()
  const mainWindow = BrowserWindow.getAllWindows()[0]
  mainWindow?.webContents.send('log:change', content)
}
