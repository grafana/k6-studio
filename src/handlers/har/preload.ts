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

export function importFile() {
  return ipcRenderer.invoke(HarHandler.ImportFile) as Promise<
    string | undefined
  >
}
