import { ipcRenderer } from 'electron'

import { GeneratorFileData } from '@/types/generator'

export function createGenerator(recordingPath: string) {
  return ipcRenderer.invoke(
    'generator:create',
    recordingPath
  ) as Promise<string>
}

export function saveGenerator(generator: GeneratorFileData, fileName: string) {
  return ipcRenderer.invoke(
    'generator:save',
    generator,
    fileName
  ) as Promise<void>
}

export function loadGenerator(fileName: string) {
  return ipcRenderer.invoke(
    'generator:open',
    fileName
  ) as Promise<GeneratorFileData>
}
