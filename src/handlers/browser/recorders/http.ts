import { spawn } from 'child_process'
import { BrowserWindow } from 'electron'
import log from 'electron-log/main'

import { BrowserHandler } from '../types'

import { getBrowserLaunchArgs } from './utils'

export async function launchBrowserWithHttpOnly(
  browserWindow: BrowserWindow,
  url: string | undefined
) {
  const { path, args } = await getBrowserLaunchArgs({
    url,
    settings: k6StudioState.appSettings,
  })

  const handleBrowserClose = (): Promise<void> => {
    // we send the browser:stopped event when the browser is closed
    // NOTE: on macos pressing the X button does not close the application so it won't be fired
    browserWindow.webContents.send(BrowserHandler.Closed)

    return Promise.resolve()
  }

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
  process.once('exit', handleBrowserClose)

  return process
}
