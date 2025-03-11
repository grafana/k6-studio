import { ipcRenderer } from 'electron'
import { CloudHandlers, RunInCloudResult, Script } from './types'
import { RunInCloudState } from '@/components/RunInCloud/states/types'
import { createListener } from '../utils'

export function run(scroåt: Script): Promise<RunInCloudResult> {
  return ipcRenderer.invoke(
    CloudHandlers.Run,
    scroåt
  ) as Promise<RunInCloudResult>
}

export function signedIn() {
  ipcRenderer.send(CloudHandlers.SignedIn)
}

export function onStateChange(callback: (state: RunInCloudState) => void) {
  return createListener(CloudHandlers.StateChange, callback)
}
