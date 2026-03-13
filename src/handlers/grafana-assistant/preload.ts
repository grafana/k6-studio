import { ipcRenderer } from 'electron'

import { createListener } from '../utils'

import {
  ConnectProcessState,
  ConnectResult,
  GrafanaAssistantConnection,
  GrafanaAssistantHandler,
} from './types'

export function connect(grafanaUrl: string): Promise<ConnectResult> {
  return ipcRenderer.invoke(
    GrafanaAssistantHandler.Connect,
    grafanaUrl
  ) as Promise<ConnectResult>
}

export function abort(): Promise<void> {
  return ipcRenderer.invoke(GrafanaAssistantHandler.Abort) as Promise<void>
}

export function getConnection(
  grafanaUrl?: string
): Promise<GrafanaAssistantConnection | null> {
  return ipcRenderer.invoke(
    GrafanaAssistantHandler.GetConnection,
    grafanaUrl
  ) as Promise<GrafanaAssistantConnection | null>
}

export function disconnect(grafanaUrl: string): Promise<void> {
  return ipcRenderer.invoke(
    GrafanaAssistantHandler.Disconnect,
    grafanaUrl
  ) as Promise<void>
}

export function onStateChange(callback: (state: ConnectProcessState) => void) {
  return createListener(GrafanaAssistantHandler.StateChange, callback)
}
