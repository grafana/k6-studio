import { ipcRenderer } from 'electron'

import { GeneratorFileData } from '@/types/generator'

import { GeneratorHandler } from './types'

export function createGenerator(recordingPath: string) {
  return ipcRenderer.invoke(
    GeneratorHandler.Create,
    recordingPath
  ) as Promise<string>
}

export function loadGenerator(fileName: string) {
  return ipcRenderer.invoke(
    GeneratorHandler.Open,
    fileName
  ) as Promise<GeneratorFileData>
}
