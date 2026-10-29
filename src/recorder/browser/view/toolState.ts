import { nanoid } from 'nanoid'

import { BrowserExtensionClient } from '../messaging'
import { getTabId, isInFrame } from '../utils'

import { useInBrowserUIStore } from './store'

let remoteToolActive: boolean | null = false

export function isRemoteToolActive(): boolean | null {
  return remoteToolActive
}

function attachTopToolState(client: BrowserExtensionClient, tab: string) {
  const session = nanoid()
  const send = (requestId?: string) => {
    client.send({
      type: 'sync-tool-state',
      tab,
      session,
      tool: useInBrowserUIStore.getState().tool,
      requestId,
    })
  }

  const offRequest = client.on('tool-state-request', ({ data }) => {
    if (data.tab === tab) {
      send(data.requestId)
    }
  })
  const offStore = useInBrowserUIStore.subscribe((state, previous) => {
    if (state.tool !== previous.tool) {
      send()
    }
  })
  const offConnect = client.onConnect(() => send())

  send()

  return () => {
    offRequest()
    offStore()
    offConnect()
  }
}

function attachChildToolState(client: BrowserExtensionClient, tab: string) {
  let requestId: string
  let session: string | null = null

  const request = () => {
    remoteToolActive = null
    session = null
    requestId = nanoid()
    client.send({ type: 'load-tool-state', tab, requestId })
  }

  const offSync = client.on('tool-state-update', ({ data }) => {
    if (data.tab !== tab) {
      return
    }

    if (data.requestId === requestId) {
      session = data.session
    } else if (data.requestId !== undefined) {
      return
    } else if (data.session !== session) {
      request()
      return
    }

    remoteToolActive = data.tool !== null
  })
  const offConnect = client.onConnect(request)
  const offDisconnect = client.onDisconnect(() => {
    remoteToolActive = null
    session = null
  })

  request()

  return () => {
    offSync()
    offConnect()
    offDisconnect()
    remoteToolActive = false
  }
}

/** Relays the top frame's tool state without mounting a tool in child frames. */
export function attachToolState(client: BrowserExtensionClient): () => void {
  const tab = getTabId()

  if (!tab) {
    return () => {}
  }

  return isInFrame()
    ? attachChildToolState(client, tab)
    : attachTopToolState(client, tab)
}
