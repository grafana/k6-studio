import { ipcRenderer } from 'electron'

import { GeneratorFileData } from '@/types/generator'

import { save } from '../file/preload'

import { GeneratorHandler } from './types'

export function createGenerator(recordingPath: string) {
  return ipcRenderer.invoke(
    GeneratorHandler.Create,
    recordingPath
  ) as Promise<string>
}

export function saveGenerator(generator: GeneratorFileData, fileName: string) {
  return save({
    content: { type: 'generator', data: generator },
    location: { type: 'legacy', name: fileName },
  })
}

export function loadGenerator(fileName: string) {
  return ipcRenderer.invoke(
    GeneratorHandler.Open,
    fileName
  ) as Promise<GeneratorFileData>
}
