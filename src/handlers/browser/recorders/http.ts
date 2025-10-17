import { ChildProcess, spawn } from 'child_process'
import { BrowserWindow } from 'electron'
import log from 'electron-log/main'

import { EventEmitter } from 'extension/src/utils/events'

import { BrowserHandler } from '../types'

import { RecordingSession, RecordingSessionEventMap } from './types'
import { getBrowserLaunchArgs } from './utils'

class HttpRecordingSession
  extends EventEmitter<RecordingSessionEventMap>
  implements RecordingSession
{
  #process: ChildProcess

  constructor(process: ChildProcess) {
    super()
    this.#process = process

    process.once('exit', () => {
      this.emit('stop', undefined)
    })
  }

  highlightElement(): void {}

  navigateTo(): void {}

  stop(): void {
    this.#process.kill()
  }
}

export async function launchBrowserWithHttpOnly(
  browserWindow: BrowserWindow,
  url: string | undefined
): Promise<RecordingSession> {
  const { path, args } = await getBrowserLaunchArgs({
    url,
    settings: k6StudioState.appSettings,
  })

  const handleBrowserLaunchError = (error: Error) => {
    log.error(error)
    browserWindow.webContents.send(BrowserHandler.Error, {
      reason: 'browser-launch',
      fatal: true,
    })
  }

  const process = spawn(path, args, {
    stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
  })

  process.on('error', handleBrowserLaunchError)

  return new HttpRecordingSession(process)
}
