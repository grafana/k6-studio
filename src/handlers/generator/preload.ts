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

export function saveGenerator(generator: GeneratorFileData, filePath: string) {
  return save({
    content: { type: 'generator', data: generator },
    location: { type: 'path', path: filePath },
  })
}
