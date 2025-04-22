import { ipcRenderer } from 'electron'

import { DataFilePreview } from '@/types/testData'

import { DataFileHandler } from './types'

export function importFile() {
  return ipcRenderer.invoke(DataFileHandler.Import) as Promise<
    string | undefined
  >
}

export function loadPreview(filePath: string) {
  return ipcRenderer.invoke(
    DataFileHandler.LoadPreview,
    filePath
  ) as Promise<DataFilePreview>
}
