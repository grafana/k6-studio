import log from 'electron-log/main'
import { WebSocketServer } from 'ws'

import {
  dispatchBridgeInvoke,
  dispatchBridgeSend,
} from '@/bridge/dispatch'
import type { BridgeClientMessage } from '@/bridge/protocol'
import {
  assignBridgeClient,
  removeBridgeClient,
} from '@/bridge/hub'

/**
 * Starts a localhost WebSocket server so a browser build can reuse the Electron
 * main-process backend (proxy, scripts, workspace files).
 *
 * Only binds to 127.0.0.1 — enable via `--studio-bridge-port=` or `K6_STUDIO_BRIDGE_PORT`.
 */
export function startStudioBridgeServer(port: number): WebSocketServer {
  const wss = new WebSocketServer({
    host: '127.0.0.1',
    port,
  })

  wss.on('connection', (ws) => {
    const clientId = assignBridgeClient(ws)

    ws.send(
      JSON.stringify({
        type: 'ready',
        clientId,
      })
    )

    ws.on('message', async (raw) => {
      let msg: BridgeClientMessage

      try {
        msg = JSON.parse(raw.toString()) as BridgeClientMessage
      } catch {
        return
      }

      try {
        if (msg.type === 'invoke') {
          const result = await dispatchBridgeInvoke(
            msg.channel,
            msg.args,
            clientId
          )
          ws.send(
            JSON.stringify({
              type: 'reply',
              id: msg.id,
              ok: true,
              result,
            })
          )
          return
        }

        if (msg.type === 'send') {
          dispatchBridgeSend(msg.channel, msg.args)
          return
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Bridge invoke failed'
        log.warn('Studio bridge invoke error:', error)

        if (msg.type === 'invoke') {
          ws.send(
            JSON.stringify({
              type: 'reply',
              id: msg.id,
              ok: false,
              error: message,
            })
          )
        }
      }
    })

    ws.on('close', () => {
      removeBridgeClient(clientId)
    })
  })

  wss.on('listening', () => {
    log.info(`Studio bridge listening on ws://127.0.0.1:${port}`)
  })

  return wss
}
