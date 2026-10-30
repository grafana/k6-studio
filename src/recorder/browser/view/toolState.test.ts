import { afterEach, describe, expect, it, vi } from 'vitest'

import { BrowserExtensionClient } from '../messaging'
import { BufferedTransport } from '../messaging/transports/buffered'
import { NullTransport } from '../messaging/transports/null'
import { BrowserExtensionMessage } from '../messaging/types'

import { useInBrowserUIStore } from './store'
import { attachToolState, isRemoteToolActive } from './toolState'

let inFrame = false

vi.mock('../utils', () => ({
  getTabId: () => 'tab-1',
  isInFrame: () => inFrame,
}))

afterEach(() => {
  inFrame = false
  useInBrowserUIStore.getState().selectTool(null)
})

describe('attachToolState', () => {
  it('replies to a child request with the top-frame tool', () => {
    const top = new BrowserExtensionClient('top')
    const transport = new NullTransport()
    const child = new BrowserExtensionClient('child', transport)
    useInBrowserUIStore.getState().selectTool('inspect')
    const disposeTop = attachToolState(top)
    top.on('sync-tool-state', ({ data }) =>
      child.send({ ...data, type: 'tool-state-update' })
    )

    inFrame = true
    let request:
      | Extract<BrowserExtensionMessage, { type: 'load-tool-state' }>
      | undefined
    child.on('load-tool-state', ({ data }) => {
      request = data
    })
    const disposeChild = attachToolState(child)

    if (request === undefined) {
      throw new Error('Child did not request the tool state')
    }

    const firstRequestId = request.requestId
    top.send({ ...request, type: 'tool-state-request' })

    expect(isRemoteToolActive()).toBe(true)
    expect(useInBrowserUIStore.getState().tool).toBe('inspect')

    useInBrowserUIStore.getState().selectTool(null)
    expect(isRemoteToolActive()).toBe(false)

    transport.emit('disconnect', undefined)
    expect(isRemoteToolActive()).toBeNull()

    transport.emit('connect', undefined)
    expect(request.requestId).not.toBe(firstRequestId)
    top.send({ ...request, type: 'tool-state-request' })
    expect(isRemoteToolActive()).toBe(false)

    disposeChild()
    disposeTop()
    top.dispose()
    child.dispose()
  })

  it('retries a lost request when the top frame connects later', () => {
    const top = new BrowserExtensionClient('top')
    const child = new BrowserExtensionClient('child')
    inFrame = true
    const disposeChild = attachToolState(child)
    expect(isRemoteToolActive()).toBeNull()
    child.on('load-tool-state', ({ data }) =>
      top.send({ ...data, type: 'tool-state-request' })
    )
    top.on('sync-tool-state', ({ data }) =>
      child.send({ ...data, type: 'tool-state-update' })
    )

    inFrame = false
    const disposeTop = attachToolState(top)
    expect(isRemoteToolActive()).toBe(false)

    disposeChild()
    disposeTop()
    top.dispose()
    child.dispose()
  })

  it('restores the latest state after buffered updates flush on reconnect', () => {
    const transport = new NullTransport()
    const connected = vi
      .spyOn(transport, 'connected', 'get')
      .mockReturnValue(false)
    const send = vi.spyOn(transport, 'send')
    const top = new BrowserExtensionClient(
      'top',
      new BufferedTransport(transport)
    )
    const dispose = attachToolState(top)
    useInBrowserUIStore.getState().selectTool('inspect')
    useInBrowserUIStore.getState().selectTool(null)

    connected.mockReturnValue(true)
    transport.emit('connect', undefined)
    expect(send.mock.calls.at(-1)).toMatchObject([
      { data: { type: 'sync-tool-state', tool: null } },
    ])

    dispose()
    top.dispose()
  })

  it('ignores states from another tab or an old request', () => {
    inFrame = true
    const child = new BrowserExtensionClient('child')
    const dispose = attachToolState(child)

    child.send({
      type: 'tool-state-update',
      tab: 'other-tab',
      session: 'other',
      tool: 'inspect',
      requestId: 'wrong',
    })

    expect(isRemoteToolActive()).toBeNull()

    dispose()
    child.dispose()
  })

  it('reattaches reconnect handling when the document is replaced', () => {
    inFrame = true
    const transport = new NullTransport()
    const client = new BrowserExtensionClient('child', transport)
    const requests = vi.fn()
    client.on('load-tool-state', requests)

    const disposeFirst = attachToolState(client)
    expect(requests).toHaveBeenCalledOnce()

    disposeFirst()
    transport.emit('connect', undefined)
    expect(requests).toHaveBeenCalledOnce()

    const disposeSecond = attachToolState(client)
    transport.emit('connect', undefined)
    expect(requests).toHaveBeenCalledTimes(3)

    disposeSecond()
    client.dispose()
  })

  it('reloads state when the top frame is reinjected in the same document', () => {
    const top = new BrowserExtensionClient('top')
    const child = new BrowserExtensionClient('child')
    const requests = vi.fn()
    top.on('sync-tool-state', ({ data }) =>
      child.send({ ...data, type: 'tool-state-update' })
    )
    child.on('load-tool-state', ({ data }) => {
      requests()
      top.send({ ...data, type: 'tool-state-request' })
    })

    const disposeFirstTop = attachToolState(top)
    inFrame = true
    const disposeChild = attachToolState(child)
    expect(isRemoteToolActive()).toBe(false)

    disposeFirstTop()
    useInBrowserUIStore.getState().selectTool('inspect')
    inFrame = false
    const disposeSecondTop = attachToolState(top)

    expect(isRemoteToolActive()).toBe(true)
    expect(requests).toHaveBeenCalledTimes(2)

    disposeSecondTop()
    disposeChild()
    top.dispose()
    child.dispose()
  })
})
