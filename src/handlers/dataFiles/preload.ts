import { ipcRenderer } from 'electron'

import { DataFilePreview } from '@/types/testData'

export function importFile() {
  return ipcRenderer.invoke('data-file:import') as Promise<string | undefined>
}

export function loadPreview(filePath: string) {
  return ipcRenderer.invoke(
    'data-file:load-preview',
    filePath
  ) as Promise<DataFilePreview>
}
