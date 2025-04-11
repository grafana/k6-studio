import { ipcRenderer } from 'electron'

import { HarWithOptionalResponse } from '@/types/har'

import { HarHandler } from './types'

export function saveFile(data: HarWithOptionalResponse, prefix: string) {
  return ipcRenderer.invoke(
    HarHandler.SaveFile,
    data,
    prefix
  ) as Promise<string>
}

export function openFile(filePath: string) {
  return ipcRenderer.invoke(
    HarHandler.OpenFile,
    filePath
  ) as Promise<HarWithOptionalResponse>
}

export function importFile() {
  return ipcRenderer.invoke(HarHandler.ImportFile) as Promise<
    string | undefined
  >
}
