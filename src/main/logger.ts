import { FSWatcher, watch } from 'chokidar'
import { BrowserWindow } from 'electron'
import log from 'electron-log/main'
import fs from 'fs/promises'
import { spawn } from 'node:child_process'
import path from 'path'

import { getPlatform } from '../utils/electron'

let watcher: FSWatcher

/**
 * Recursively unwraps an AggregateError into its constituent errors. A new line
 * will be added between each error for better readability in the logs.
 */
function unwrapAggregateError(error: unknown): unknown[] {
  if (error instanceof AggregateError) {
    return [
      error,
      ...error.errors.flatMap((err) => ['\n', ...unwrapAggregateError(err)]),
    ]
  }

  return [error]
}

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

  log.hooks.push((msg) => {
    const hasAggregateError = msg.data.some(
      (data) => data instanceof AggregateError
    )

    if (!hasAggregateError) {
      return msg
    }

    return {
      ...msg,
      data: msg.data.flatMap<unknown>(unwrapAggregateError),
    }
  })

  // initialize chokidar watcher to watch log file
  watcher = watch(log.transports.file.getFile().path)
  watcher.on('change', onLogChange)
}

export function openLogFolder() {
  const logFile = log.transports.file.getFile().path
  const logPath = path.dirname(logFile)

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
