import { ipcMain } from 'electron'

import { openLogFolder, getLogContent } from '@/logger'

import { LogHandler } from './types'

export function initialize() {
  ipcMain.on(LogHandler.OPEN, () => {
    console.info(`${LogHandler.OPEN} event received`)
    openLogFolder()
  })

  ipcMain.handle(LogHandler.READ, () => {
    console.info(`${LogHandler.READ} event received`)
    return getLogContent()
  })
}
