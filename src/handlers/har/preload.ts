import { ipcRenderer } from 'electron'
import * as path from 'pathe'
import invariant from 'tiny-invariant'

import { RecordingData } from '@/types/recordingData'

import { open as openFileViaHandler } from '../file/preload'
import { FileLocation } from '../file/types'

import { HarHandler } from './types'

export function saveFile(data: RecordingData, prefix: string) {
  return ipcRenderer.invoke(
    HarHandler.SaveFile,
    data,
    prefix
  ) as Promise<string>
}

export async function openFile(filePath: string): Promise<RecordingData> {
  const location: FileLocation = path.isAbsolute(filePath)
    ? { type: 'path', path: filePath }
    : { type: 'legacy', name: filePath }

  const result = await openFileViaHandler({
    location,
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
