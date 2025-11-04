import { ipcRenderer } from 'electron'

import { createListener } from '../utils'

import { LogHandler } from './types'

export function openLogFolder() {
  ipcRenderer.send(LogHandler.Open)
}

export function getLogContent() {
  return ipcRenderer.invoke(LogHandler.Read) as Promise<string>
}

export function onLogChange(callback: (content: string) => void) {
  return createListener(LogHandler.Change, callback)
}
