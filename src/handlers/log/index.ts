import { ipcMain } from 'electron'

import { openLogFolder, getLogContent } from '@/main/logger'

import { LogHandler } from './types'

export function initialize() {
  ipcMain.on(LogHandler.Open, () => {
    console.info(`${LogHandler.Open} event received`)
    openLogFolder()
  })

  ipcMain.handle(LogHandler.Read, () => {
    console.info(`${LogHandler.Read} event received`)
    return getLogContent()
  })
}
