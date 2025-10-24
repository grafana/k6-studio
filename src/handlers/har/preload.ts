import { ipcRenderer } from 'electron'

import { Recording } from '@/schemas/recording'

import { HarHandler } from './types'

export function saveFile(data: Recording, prefix: string) {
  return ipcRenderer.invoke(
    HarHandler.SaveFile,
    data,
    prefix
  ) as Promise<string>
}

export function openFile(filePath: string) {
  return ipcRenderer.invoke(HarHandler.OpenFile, filePath) as Promise<Recording>
}

export function importFile() {
  return ipcRenderer.invoke(HarHandler.ImportFile) as Promise<
    string | undefined
  >
}
