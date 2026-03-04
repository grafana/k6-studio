import { ipcRenderer } from 'electron'
import invariant from 'tiny-invariant'

import { BrowserTestFile } from '@/schemas/browserTest/v1'

import { open as openFile, save as saveFile } from '../file/preload'

import { BrowserTestHandler } from './types'

export function create() {
  return ipcRenderer.invoke(BrowserTestHandler.Create) as Promise<string>
}

export async function open(fileName: string): Promise<BrowserTestFile> {
  const result = await openFile({
    location: { type: 'legacy', name: fileName },
    fileType: 'browser-test',
  })

  invariant(result.type === 'browser-test', 'Expected browser-test content')

  return result.data
}

export function save(fileName: string, data: BrowserTestFile) {
  return saveFile({
    content: { type: 'browser-test', data },
    location: { type: 'legacy', name: fileName },
  })
}
