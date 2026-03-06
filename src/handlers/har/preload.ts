import { ipcRenderer } from 'electron'
import invariant from 'tiny-invariant'

import { RecordingData } from '@/types/recordingData'

import { open as openFileViaHandler } from '../file/preload'

import { HarHandler } from './types'

export function saveFile(data: RecordingData, prefix: string) {
  return ipcRenderer.invoke(
    HarHandler.SaveFile,
    data,
    prefix
  ) as Promise<string>
}

export async function openFile(filePath: string): Promise<RecordingData> {
  const result = await openFileViaHandler(filePath)

  invariant(result.type === 'recording', 'Expected recording content')

  return result.data
}

export function importFile() {
  return ipcRenderer.invoke(HarHandler.ImportFile) as Promise<
    string | undefined
  >
}
