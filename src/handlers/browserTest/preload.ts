import { ipcRenderer } from 'electron'

import { BrowserTestFile } from '@/schemas/browserTest/v1'

import { BrowserTestHandler } from './types'

export function create() {
  return ipcRenderer.invoke(BrowserTestHandler.Create) as Promise<string>
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
