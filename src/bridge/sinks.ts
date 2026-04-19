import type { BrowserWindow } from 'electron'

import { sendBridgeEventToClient } from '@/bridge/hub'
import type { ScriptIpcSink } from '@/bridge/scriptSinkTypes'

export function createBridgeScriptSink(clientId: string): ScriptIpcSink {
  return {
    send(channel: string, ...args: unknown[]) {
      sendBridgeEventToClient(clientId, channel, args)
    },
  }
}

export function scriptSinkFromBrowserWindow(
  browserWindow: BrowserWindow
): ScriptIpcSink {
  return {
    send(channel: string, ...args: unknown[]) {
      browserWindow.webContents.send(channel, ...(args as never[]))
    },
  }
}
