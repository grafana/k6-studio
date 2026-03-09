import { afterEach, describe, expect, it, vi } from 'vitest'

import { BrowserExtensionClient } from 'extension/src/messaging'
import { NullTransport } from 'extension/src/messaging/transports/null'
import { WebSocketServerTransport } from 'extension/src/messaging/transports/webSocketServer'
import { InBrowserSettings } from 'extension/src/messaging/types'

import { BrowserServer } from './server'

describe('BrowserServer', () => {
  const serversToStop: BrowserServer[] = []

  const createServer = () => {
    const client = new BrowserExtensionClient('test', new NullTransport())
    const server = new BrowserServer(client)

    serversToStop.push(server)

    return { client, server }
  }

  afterEach(() => {
    for (const server of serversToStop.splice(0)) {
      server.stop()
    }

    vi.restoreAllMocks()
  })

  it('starts the websocket server on ipv4 loopback', async () => {
    const createSpy = vi
      .spyOn(WebSocketServerTransport, 'create')
      .mockResolvedValue(
        new NullTransport() as unknown as WebSocketServerTransport
      )

    const server = await BrowserServer.start()
    serversToStop.push(server)

    expect(createSpy).toHaveBeenCalledWith('127.0.0.1', 7554)
  })

  it('syncs settings per tab for load/save events', () => {
    const { client } = createServer()
    const syncMessages: Array<{
      tab: string
      settings: InBrowserSettings | null
    }> = []

    client.on('sync-settings', ({ data }) => {
      syncMessages.push({
        tab: data.tab,
        settings: data.settings,
      })
    })

    const settings: InBrowserSettings = {
      toolbox: {
        position: {
          left: 120,
        },
      },
    }

    client.send({ type: 'load-settings', tab: 'tab-1' })
    client.send({ type: 'save-settings', tab: 'tab-1', settings })
    client.send({ type: 'load-settings', tab: 'tab-1' })
    client.send({ type: 'load-settings', tab: 'tab-2' })

    expect(syncMessages).toEqual([
      { tab: 'tab-1', settings: null },
      { tab: 'tab-1', settings },
      { tab: 'tab-1', settings },
      { tab: 'tab-2', settings: null },
    ])
  })

  it('emits record events with the correct source metadata', () => {
    const { client, server } = createServer()
    const recordHandler = vi.fn()

    server.on('record', recordHandler)

    client.send({ type: 'record-events', events: [] })
    client.send({ type: 'events-recorded', events: [] })

    expect(recordHandler).toHaveBeenNthCalledWith(1, {
      source: 'record-events',
      events: [],
    })
    expect(recordHandler).toHaveBeenNthCalledWith(2, {
      source: 'events-recorded',
      events: [],
    })
  })
})
