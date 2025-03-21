import { ipcRenderer } from 'electron'

import { RunInCloudState } from '@/components/RunInCloudDialog/states/types'

import { createListener } from '../utils'

import { CloudHandlers, RunInCloudResult, Script } from './types'

export function run(script: Script): Promise<RunInCloudResult> {
  return ipcRenderer.invoke(
    CloudHandlers.Run,
    script
  ) as Promise<RunInCloudResult>
}

export function signedIn() {
  ipcRenderer.send(CloudHandlers.SignedIn)
}

export function onStateChange(callback: (state: RunInCloudState) => void) {
  return createListener(CloudHandlers.StateChange, callback)
}
