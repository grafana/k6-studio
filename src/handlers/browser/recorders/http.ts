import { ChildProcess, spawn } from 'child_process'

import { EventEmitter } from 'extension/src/utils/events'

import {
  BrowserLaunchError,
  RecordingSession,
  RecordingSessionEventMap,
} from './types'
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
  url: string | undefined
): Promise<RecordingSession> {
  const { path, args } = await getBrowserLaunchArgs({
    url,
    settings: k6StudioState.appSettings,
  })

  const { promise, resolve, reject } =
    Promise.withResolvers<HttpRecordingSession>()

  let spawned = false

  const process = spawn(path, args, {
    stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
  })

  process.on('spawn', () => {
    spawned = true

    resolve(new HttpRecordingSession(process))
  })

  process.on('error', (error) => {
    reject(new BrowserLaunchError('browser-launch', error))
  })

  process.once('exit', (code, signal) => {
    if (spawned) {
      return
    }

    reject(
      new BrowserLaunchError(
        'browser-launch',
        `Browser failed to spawn with code ${code ?? signal}`
      )
    )
  })

  return promise
}
