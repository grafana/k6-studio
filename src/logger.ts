import log from 'electron-log/main'
import { spawn } from 'node:child_process'
import path from 'node:path'

export function initializeLogger() {
  // allow logs to be triggered from the renderer process
  // @see https://github.com/megahertz/electron-log/blob/master/docs/initialize.md
  log.initialize()

  // log electron core events
  // @see https://github.com/megahertz/electron-log/blob/master/docs/events.md
  log.eventLogger.startLogging()

  // log uncaught exceptions
  // @see https://github.com/megahertz/electron-log/blob/master/docs/errors.md
  log.errorHandler.startCatching()

  log.transports.file.fileName = 'k6-studio.log'
  if (process.env.NODE_ENV === 'development') {
    log.transports.file.fileName = 'k6-studio-dev.log'
  }
}

export function openLogFolder() {
  const logFile = log.transports.file.getFile().path
  const logPath = path.dirname(logFile)

  // supports only Mac and Windows at this time
  const executable = process.platform === 'darwin' ? 'open' : 'explorer'
  spawn(executable, [logPath])
}
