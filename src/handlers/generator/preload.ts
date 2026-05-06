import { ipcRenderer } from 'electron'

import { GeneratorFileData } from '@/types/generator'

import { GeneratorHandler } from './types'

export function createGenerator(recordingPath: string) {
  return ipcRenderer.invoke(
    GeneratorHandler.Create,
    recordingPath
  ) as Promise<string>
}

export function saveGenerator(generator: GeneratorFileData, filePath: string) {
  return ipcRenderer.invoke(
    GeneratorHandler.Save,
    generator,
    filePath
  ) as Promise<void>
}

export function loadGenerator(filePath: string) {
  return ipcRenderer.invoke(
    GeneratorHandler.Open,
    filePath
  ) as Promise<GeneratorFileData>
}
