import { ipcRenderer } from 'electron'
import invariant from 'tiny-invariant'

import { Recording } from '@/schemas/recording'

import { open as openFileViaHandler } from '../file/preload'

import { HarHandler } from './types'

export function saveFile(data: Recording, prefix: string) {
  return ipcRenderer.invoke(
    HarHandler.SaveFile,
    data,
    prefix
  ) as Promise<string>
}

export async function openFile(filePath: string): Promise<Recording> {
  const result = await openFileViaHandler({
    location: { type: 'legacy', name: filePath },
    fileType: 'recording',
  })

  invariant(result.type === 'recording', 'Expected recording content')

  return result.data
}

export function importFile() {
  return ipcRenderer.invoke(HarHandler.ImportFile) as Promise<
    string | undefined
  >
}
