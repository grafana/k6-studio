import { ipcRenderer } from 'electron'

import { GeneratorHandler } from './types'

export function createGenerator(recordingPath: string) {
  return ipcRenderer.invoke(
    GeneratorHandler.Create,
    recordingPath
  ) as Promise<string>
}
