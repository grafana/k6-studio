import { ipcRenderer } from 'electron'

import { BrowserTestFile } from '@/schemas/browserTest/v1'

import { save as saveFile } from '../file/preload'

import { BrowserTestHandler } from './types'

export function create() {
  return ipcRenderer.invoke(BrowserTestHandler.Create) as Promise<string>
}

export function save(filePath: string, data: BrowserTestFile) {
  return saveFile({
    content: { type: 'browser-test', data },
    location: { type: 'path', path: filePath },
  })
}
