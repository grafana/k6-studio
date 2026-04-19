/**
 * WebSocket messages between k6 Studio (Electron main bridge) and the web UI client.
 */

export type BridgeClientMessage =
  | BridgeInvokeMessage
  | BridgeSendMessage

export interface BridgeInvokeMessage {
  type: 'invoke'
  id: string
  channel: string
  args?: unknown[]
}

export interface BridgeSendMessage {
  type: 'send'
  channel: string
  args?: unknown[]
}

export type BridgeServerMessage =
  | BridgeReadyMessage
  | BridgeReplyMessage
  | BridgeEventMessage

export interface BridgeReadyMessage {
  type: 'ready'
  clientId: string
}

export interface BridgeReplyMessage {
  type: 'reply'
  id: string
  ok: boolean
  result?: unknown
  error?: string
}

export interface BridgeEventMessage {
  type: 'event'
  channel: string
  args: unknown[]
}
