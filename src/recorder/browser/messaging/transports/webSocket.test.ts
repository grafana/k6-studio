import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { WebSocketTransport } from './webSocket'

class FakeWebSocket {
  static OPEN = 1
  readyState = FakeWebSocket.OPEN

  listeners = new Map<string, Array<(...args: unknown[]) => void>>()

  constructor(public url: string) {
    FakeWebSocket.instances.push(this)
  }

  addEventListener(event: string, handler: (...args: unknown[]) => void) {
    const list = this.listeners.get(event) ?? []
    list.push(handler)
    this.listeners.set(event, list)
  }

  send = vi.fn()

  close() {
    this.readyState = 3
    for (const handler of this.listeners.get('close') ?? []) {
      handler()
    }
  }

  static instances: FakeWebSocket[] = []
  static reset() {
    FakeWebSocket.instances = []
  }
}

describe('WebSocketTransport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    FakeWebSocket.reset()
    vi.stubGlobal('WebSocket', FakeWebSocket)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('does not reconnect after dispose', () => {
    const transport = new WebSocketTransport('ws://localhost:1234')

    expect(FakeWebSocket.instances).toHaveLength(1)

    transport.dispose()

    vi.advanceTimersByTime(5000)

    expect(FakeWebSocket.instances).toHaveLength(1)
  })

  it('reconnects on close when not disposed', () => {
    const _transport = new WebSocketTransport('ws://localhost:1234')

    expect(FakeWebSocket.instances).toHaveLength(1)

    const socket = FakeWebSocket.instances[0]!
    socket.close()

    vi.advanceTimersByTime(2500)

    expect(FakeWebSocket.instances).toHaveLength(2)
  })
})
