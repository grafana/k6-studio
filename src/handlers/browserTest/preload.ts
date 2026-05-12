import { ipcRenderer } from 'electron'

import { AnyBrowserAction, BrowserTestFile } from '@/schemas/browserTest'

import { BrowserTestHandler } from './types'

export function create(actions?: AnyBrowserAction[]) {
  return ipcRenderer.invoke(
    BrowserTestHandler.Create,
    actions
  ) as Promise<string>
}

export function open(filePath: string) {
  return ipcRenderer.invoke(
    BrowserTestHandler.Open,
    filePath
  ) as Promise<BrowserTestFile>
}

export function save(filePath: string, data: BrowserTestFile) {
  return ipcRenderer.invoke(
    BrowserTestHandler.Save,
    filePath,
    data
  ) as Promise<void>
}
