import { ipcRenderer } from 'electron'

import { RecordingData } from '@/types/recordingData'

import { HarHandler } from './types'

export function saveFile(data: RecordingData, prefix: string) {
  return ipcRenderer.invoke(
    HarHandler.SaveFile,
    data,
    prefix
  ) as Promise<string>
}
