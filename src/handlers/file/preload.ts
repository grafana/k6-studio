import { ipcRenderer } from 'electron'

import { FileHandler, SaveFilePayload } from './types'

export function save(payload: SaveFilePayload) {
  return ipcRenderer.invoke(FileHandler.Save, payload) as Promise<void>
}
