import { ipcRenderer } from 'electron'
import invariant from 'tiny-invariant'

import { GeneratorFileData } from '@/types/generator'

import { open as openFile, save } from '../file/preload'

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

export async function loadGenerator(
  filePath: string
): Promise<GeneratorFileData> {
  const result = await openFile(filePath)

  invariant(result.type === 'generator', 'Expected generator content')

  return result.data
}
