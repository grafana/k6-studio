import { ipcRenderer } from 'electron'
import { CloudHandlers, RunInCloudResult } from './types'
import { RunInCloudState } from '@/components/RunInCloud/types'
import { createListener } from '../utils'

export function run(scriptPath: string): Promise<RunInCloudResult> {
  return ipcRenderer.invoke(
    CloudHandlers.Run,
    scriptPath
  ) as Promise<RunInCloudResult>
}

export function signedIn() {
  ipcRenderer.send(CloudHandlers.SignedIn)
}

export function onStateChange(callback: (state: RunInCloudState) => void) {
  return createListener(CloudHandlers.StateChange, callback)
}
