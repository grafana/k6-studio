import { ipcRenderer } from 'electron'

import { BrowserTestFile } from '@/schemas/browserTest/v1'

import { BrowserTestHandler } from './types'

export function create() {
  return ipcRenderer.invoke(BrowserTestHandler.Create) as Promise<string>
}

export function open(fileName: string) {
  return ipcRenderer.invoke(
    BrowserTestHandler.Open,
    fileName
  ) as Promise<BrowserTestFile>
}
