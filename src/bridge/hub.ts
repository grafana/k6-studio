/**
 * Routes IPC-like events from the Electron main process to connected web bridge clients.
 */

import type { WebSocket } from 'ws'

import type {
  BridgeEventMessage,
  BridgeServerMessage,
} from '@/bridge/protocol'

type ClientRecord = {
  ws: WebSocket
}

const bridgeClients = new Map<string, ClientRecord>()

let seq = 0

function serialize(msg: BridgeServerMessage) {
  return JSON.stringify(msg)
}

export function assignBridgeClient(ws: WebSocket): string {
  const clientId = `bridge-${++seq}-${Date.now()}`
  bridgeClients.set(clientId, { ws })
  return clientId
}

export function removeBridgeClient(clientId: string) {
  bridgeClients.delete(clientId)
}

/** Broadcast proxy + shared UI events to every connected web client */
export function broadcastBridgeEvent(channel: string, args: unknown[]) {
  const msg = serialize({
    type: 'event',
    channel,
    args,
  } satisfies BridgeEventMessage)
  for (const { ws } of bridgeClients.values()) {
    if (ws.readyState === ws.OPEN) {
      ws.send(msg)
    }
  }
}

/** Script / single-client events initiated from the web bridge */
export function sendBridgeEventToClient(
  clientId: string,
  channel: string,
  args: unknown[]
) {
  const record = bridgeClients.get(clientId)
  if (!record || record.ws.readyState !== record.ws.OPEN) {
    return
  }
  record.ws.send(
    serialize({
      type: 'event',
      channel,
      args,
    } satisfies BridgeEventMessage)
  )
}
