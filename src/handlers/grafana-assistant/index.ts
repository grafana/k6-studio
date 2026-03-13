import { ipcMain } from 'electron'
import log from 'electron-log/main'

import { browserWindowFromEvent } from '@/utils/electron'

import { ConnectStateMachine } from './states'
import {
  getConnection,
  getFirstStoredGrafanaUrl,
  removeConnection,
} from './storage'
import {
  ConnectResult,
  GrafanaAssistantConnection,
  GrafanaAssistantHandler,
} from './types'

export function initialize() {
  let pending: ConnectStateMachine | null = null

  ipcMain.handle(
    GrafanaAssistantHandler.Connect,
    async (event, grafanaUrl: string): Promise<ConnectResult> => {
      const browserWindow = browserWindowFromEvent(event)

      try {
        if (pending !== null) {
          pending.abort()
          pending = null
        }

        pending = new ConnectStateMachine(grafanaUrl)

        pending.on('state-change', (state) => {
          browserWindow.webContents.send(
            GrafanaAssistantHandler.StateChange,
            state
          )
        })

        return await pending.start()
      } catch (error) {
        log.error('Unexpected error during Grafana Assistant connect.', error)
        throw error
      } finally {
        pending = null
      }
    }
  )

  ipcMain.handle(GrafanaAssistantHandler.Abort, () => {
    pending?.abort()
    pending = null
  })

  ipcMain.handle(
    GrafanaAssistantHandler.GetConnection,
    async (
      _event,
      grafanaUrl?: string
    ): Promise<GrafanaAssistantConnection | null> => {
      const url = grafanaUrl ?? (await getFirstStoredGrafanaUrl())
      if (!url) return null

      const conn = await getConnection(url)
      if (!conn) return null

      return {
        grafanaUrl: url,
        apiEndpoint: conn.apiEndpoint,
        expiresAt: conn.expiresAt,
      }
    }
  )

  ipcMain.handle(
    GrafanaAssistantHandler.Disconnect,
    async (_event, grafanaUrl: string): Promise<void> => {
      await removeConnection(grafanaUrl)
    }
  )
}
