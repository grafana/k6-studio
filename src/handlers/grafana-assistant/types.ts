export enum GrafanaAssistantHandler {
  Connect = 'grafana-assistant:connect',
  Disconnect = 'grafana-assistant:disconnect',
  GetConnection = 'grafana-assistant:get-connection',
  StateChange = 'grafana-assistant:state-change',
  Abort = 'grafana-assistant:abort',
}

export interface GrafanaAssistantConnection {
  grafanaUrl: string
  apiEndpoint: string
  expiresAt: string
}

export type ConnectProcessState =
  | { type: 'authorizing' }
  | { type: 'exchanging' }
  | { type: 'completed'; connection: GrafanaAssistantConnection }
  | { type: 'error'; message: string }

export type ConnectResult =
  | { type: 'connected'; connection: GrafanaAssistantConnection }
  | { type: 'aborted' }
  | { type: 'error'; message: string }
