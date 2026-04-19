import { ipcRenderer } from 'electron'

import { Recording } from '@/schemas/recording'

import { ValidatorRunHandler } from './types'

export function saveSession(
  data: Recording,
  runSourceLabel: string,
  startedAtMs: number
) {
  return ipcRenderer.invoke(
    ValidatorRunHandler.SaveSession,
    data,
    runSourceLabel,
    startedAtMs
  ) as Promise<string | undefined>
}

export function openFile(fileName: string) {
  return ipcRenderer.invoke(
    ValidatorRunHandler.OpenFile,
    fileName
  ) as Promise<Recording>
}
