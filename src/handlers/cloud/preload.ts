import { ipcRenderer } from 'electron'

import { RunInCloudState } from '@/components/RunInCloudDialog/states/types'

import { createListener } from '../utils'

import {
  CloudHandlers,
  RawScript,
  RunInCloudResult,
  Script,
  VuhEstimate,
} from './types'

export function run(script: Script): Promise<RunInCloudResult> {
  return ipcRenderer.invoke(
    CloudHandlers.Run,
    script
  ) as Promise<RunInCloudResult>
}

export function estimateVuh(script: RawScript): Promise<VuhEstimate | null> {
  return ipcRenderer.invoke(
    CloudHandlers.EstimateVuh,
    script
  ) as Promise<VuhEstimate | null>
}

export function signedIn() {
  ipcRenderer.send(CloudHandlers.SignedIn)
}

export function onStateChange(callback: (state: RunInCloudState) => void) {
  return createListener(CloudHandlers.StateChange, callback)
}
