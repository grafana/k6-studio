import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BrowserEventTarget } from '@/schemas/recording'

import { FrameAgent, FrameMessageEvent } from './frames'

type Listener = (event: FrameMessageEvent) => void

/**
 * Minimal stand-in for a frame's window. Real cross-origin frames can't be
 * simulated under jsdom, so agents are wired together through these fakes:
 * an agent sends by calling deliverFrom on the target, which dispatches a
 * message event with the sender attached as `source`.
 */
class FakeFrameWindow {
  #listeners: Listener[] = []

  addEventListener(_type: 'message', listener: Listener) {
    this.#listeners.push(listener)
  }

  removeEventListener(_type: 'message', listener: Listener) {
    this.#listeners = this.#listeners.filter((entry) => entry !== listener)
  }

  deliverFrom(sender: FakeFrameWindow, data: unknown) {
    this.#listeners.forEach((listener) => listener({ data, source: sender }))
  }
}

/**
 * Send function bound to the sending agent's window, standing in for the
 * browser attributing `event.source` on postMessage.
 */
function sendFrom(sender: FakeFrameWindow) {
  return (target: unknown, envelope: unknown) => {
    if (target instanceof FakeFrameWindow) {
      target.deliverFrom(sender, envelope)
    }
  }
}

const locator = (id: string): BrowserEventTarget => ({
  selectors: { css: id },
})

function createAgent(
  overrides: Partial<ConstructorParameters<typeof FrameAgent>[0]> = {}
) {
  const win = new FakeFrameWindow()

  const agent = new FrameAgent({
    win,
    parentWindow: null,
    getFrames: () => [],
    getIframeLocator: () => locator('iframe#unused'),
    getOwnPath: () => Promise.resolve([]),
    send: sendFrom(win),
    ...overrides,
  })

  return { win, agent }
}

describe('FrameAgent.requestFramePath', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves an empty path immediately in the top frame', async () => {
    const { agent } = createAgent({ parentWindow: null })

    await expect(agent.requestFramePath()).resolves.toEqual([])
  })

  it('resolves the path from a frame-path-response with a matching id', async () => {
    const parentWin = new FakeFrameWindow()
    const { win, agent } = createAgent({ parentWindow: parentWin })

    const sent: unknown[] = []
    parentWin.addEventListener('message', (event) => sent.push(event.data))

    const pathPromise = agent.requestFramePath()

    const [envelope] = sent as [{ message: { type: string; id: string } }]

    expect(envelope.message.type).toBe('frame-path-request')

    win.deliverFrom(parentWin, {
      source: 'k6-studio-frames',
      version: 1,
      message: {
        type: 'frame-path-response',
        id: envelope.message.id,
        path: [locator('iframe#outer')],
      },
    })

    await expect(pathPromise).resolves.toEqual([locator('iframe#outer')])
  })

  it('resolves null when no response arrives before the timeout', async () => {
    const parentWin = new FakeFrameWindow()
    const { agent } = createAgent({
      parentWindow: parentWin,
      requestTimeoutMs: 1000,
    })

    const pathPromise = agent.requestFramePath()

    vi.advanceTimersByTime(1000)

    await expect(pathPromise).resolves.toBeNull()
  })

  it('ignores messages that do not match the protocol envelope', async () => {
    const parentWin = new FakeFrameWindow()
    const { win, agent } = createAgent({
      parentWindow: parentWin,
      requestTimeoutMs: 1000,
    })

    const pathPromise = agent.requestFramePath()

    win.deliverFrom(parentWin, {
      type: 'frame-path-response',
      id: 'spoof',
      path: [],
    })
    win.deliverFrom(parentWin, 'not even an object')

    vi.advanceTimersByTime(1000)

    await expect(pathPromise).resolves.toBeNull()
  })

  it('ignores a response coming from a window other than the parent', async () => {
    const parentWin = new FakeFrameWindow()
    const intruder = new FakeFrameWindow()
    const { win, agent } = createAgent({
      parentWindow: parentWin,
      requestTimeoutMs: 1000,
    })

    const sent: unknown[] = []
    parentWin.addEventListener('message', (event) => sent.push(event.data))

    const pathPromise = agent.requestFramePath()

    const [envelope] = sent as [{ message: { id: string } }]

    win.deliverFrom(intruder, {
      source: 'k6-studio-frames',
      version: 1,
      message: {
        type: 'frame-path-response',
        id: envelope.message.id,
        path: [locator('iframe#evil')],
      },
    })

    vi.advanceTimersByTime(1000)

    await expect(pathPromise).resolves.toBeNull()
  })
})

describe('FrameAgent responder', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function linkChild(parentSetup: {
    getOwnPath?: () => Promise<BrowserEventTarget[] | null>
  }) {
    const childWin = new FakeFrameWindow()
    const iframeElement = { id: 'child-iframe' } as unknown as Element

    const { win: parentWin } = createAgent({
      getFrames: () => [{ element: iframeElement, contentWindow: childWin }],
      getIframeLocator: () => locator('iframe#child'),
      getOwnPath: parentSetup.getOwnPath ?? (() => Promise.resolve([])),
    })

    return { parentWin, childWin }
  }

  function requestFromChild(
    parentWin: FakeFrameWindow,
    childWin: FakeFrameWindow
  ) {
    const received: unknown[] = []
    childWin.addEventListener('message', (event) => received.push(event.data))

    parentWin.deliverFrom(childWin, {
      source: 'k6-studio-frames',
      version: 1,
      message: { type: 'frame-path-request', id: 'req-1' },
    })

    return received
  }

  it('responds with its own path plus the child iframe locator', async () => {
    const { parentWin, childWin } = linkChild({
      getOwnPath: () => Promise.resolve([locator('iframe#outer')]),
    })

    const received = requestFromChild(parentWin, childWin)

    await vi.runAllTimersAsync()

    expect(received).toEqual([
      {
        source: 'k6-studio-frames',
        version: 1,
        message: {
          type: 'frame-path-response',
          id: 'req-1',
          path: [locator('iframe#outer'), locator('iframe#child')],
        },
      },
    ])
  })

  it('responds with a null path when its own path is unknown', async () => {
    const { parentWin, childWin } = linkChild({
      getOwnPath: () => Promise.resolve(null),
    })

    const received = requestFromChild(parentWin, childWin)

    await vi.runAllTimersAsync()

    expect(received).toEqual([
      {
        source: 'k6-studio-frames',
        version: 1,
        message: { type: 'frame-path-response', id: 'req-1', path: null },
      },
    ])
  })

  it('ignores requests from windows that are not its own frames', async () => {
    const { parentWin, childWin } = linkChild({})
    const intruder = new FakeFrameWindow()

    const received: unknown[] = []
    childWin.addEventListener('message', (event) => received.push(event.data))

    parentWin.deliverFrom(intruder, {
      source: 'k6-studio-frames',
      version: 1,
      message: { type: 'frame-path-request', id: 'req-1' },
    })

    await vi.runAllTimersAsync()

    expect(received).toEqual([])
  })
})

describe('FrameAgent default send', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('posts to a parent window that only exposes postMessage, like a cross-origin WindowProxy', () => {
    const win = new FakeFrameWindow()
    const postMessage = vi.fn()
    const parentWindow = { postMessage }

    const agent = new FrameAgent({
      win,
      parentWindow,
      getFrames: () => [],
      getIframeLocator: () => locator('iframe#unused'),
      getOwnPath: () => Promise.resolve([]),
    })

    void agent.requestFramePath()

    expect(postMessage).toHaveBeenCalledTimes(1)

    const [envelope, targetOrigin] = postMessage.mock.calls[0] as [
      { source: string; message: { type: string } },
      string,
    ]

    expect(envelope.source).toBe('k6-studio-frames')
    expect(envelope.message.type).toBe('frame-path-request')
    expect(targetOrigin).toBe('*')

    agent.dispose()
  })
})

describe('FrameAgent handshake and tool state', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retries the handshake until acknowledged and caches the acked tool state', () => {
    const parentWin = new FakeFrameWindow()
    const { win, agent } = createAgent({ parentWindow: parentWin })

    const sent: Array<{ message: { type: string; id: string } }> = []
    parentWin.addEventListener('message', (event) => {
      sent.push(event.data as { message: { type: string; id: string } })
    })

    agent.announce()

    expect(sent).toHaveLength(1)

    vi.advanceTimersByTime(100)

    expect(sent).toHaveLength(2)
    expect(sent.every((entry) => entry.message.type === 'handshake')).toBe(true)

    win.deliverFrom(parentWin, {
      source: 'k6-studio-frames',
      version: 1,
      message: {
        type: 'handshake-ack',
        id: sent[1]?.message.id ?? '',
        toolActive: true,
      },
    })

    expect(agent.isToolActive).toBe(true)

    // Acked: no further retries.
    vi.advanceTimersByTime(10_000)

    expect(sent).toHaveLength(2)
  })

  it('stops retrying the handshake after the attempt limit', () => {
    const parentWin = new FakeFrameWindow()
    const { agent } = createAgent({ parentWindow: parentWin })

    const sent: unknown[] = []
    parentWin.addEventListener('message', (event) => sent.push(event.data))

    agent.announce()

    vi.advanceTimersByTime(60_000)

    expect(sent).toHaveLength(5)
  })

  it('acknowledges a child handshake with the current tool state', () => {
    const childWin = new FakeFrameWindow()
    const iframeElement = { id: 'child-iframe' } as unknown as Element

    const { win: parentWin, agent } = createAgent({
      getFrames: () => [{ element: iframeElement, contentWindow: childWin }],
    })

    agent.broadcastToolState(true)

    const received: unknown[] = []
    childWin.addEventListener('message', (event) => received.push(event.data))

    parentWin.deliverFrom(childWin, {
      source: 'k6-studio-frames',
      version: 1,
      message: { type: 'handshake', id: 'hs-1' },
    })

    expect(received).toContainEqual({
      source: 'k6-studio-frames',
      version: 1,
      message: { type: 'handshake-ack', id: 'hs-1', toolActive: true },
    })
  })

  it('relays tool-state from the parent to its own child frames and caches it', () => {
    const parentWin = new FakeFrameWindow()
    const grandchildWin = new FakeFrameWindow()
    const iframeElement = { id: 'grandchild-iframe' } as unknown as Element

    const { win, agent } = createAgent({
      parentWindow: parentWin,
      getFrames: () => [
        { element: iframeElement, contentWindow: grandchildWin },
      ],
    })

    const relayed: unknown[] = []
    grandchildWin.addEventListener('message', (event) =>
      relayed.push(event.data)
    )

    win.deliverFrom(parentWin, {
      source: 'k6-studio-frames',
      version: 1,
      message: { type: 'tool-state', active: true },
    })

    expect(agent.isToolActive).toBe(true)
    expect(relayed).toEqual([
      {
        source: 'k6-studio-frames',
        version: 1,
        message: { type: 'tool-state', active: true },
      },
    ])
  })

  it('relays the acked tool state to its own child frames on handshake-ack', () => {
    const parentWin = new FakeFrameWindow()
    const childWin = new FakeFrameWindow()
    const iframeElement = { id: 'child-iframe' } as unknown as Element

    const { win, agent } = createAgent({
      parentWindow: parentWin,
      getFrames: () => [{ element: iframeElement, contentWindow: childWin }],
    })

    const sent: Array<{ message: { type: string; id: string } }> = []
    parentWin.addEventListener('message', (event) => {
      sent.push(event.data as { message: { type: string; id: string } })
    })

    agent.announce()

    const relayed: unknown[] = []
    childWin.addEventListener('message', (event) => relayed.push(event.data))

    win.deliverFrom(parentWin, {
      source: 'k6-studio-frames',
      version: 1,
      message: {
        type: 'handshake-ack',
        id: sent[0]?.message.id ?? '',
        toolActive: true,
      },
    })

    expect(agent.isToolActive).toBe(true)
    expect(relayed).toEqual([
      {
        source: 'k6-studio-frames',
        version: 1,
        message: { type: 'tool-state', active: true },
      },
    ])
  })

  it('ignores tool-state that does not come from the parent', () => {
    const parentWin = new FakeFrameWindow()
    const intruder = new FakeFrameWindow()
    const { win, agent } = createAgent({ parentWindow: parentWin })

    win.deliverFrom(intruder, {
      source: 'k6-studio-frames',
      version: 1,
      message: { type: 'tool-state', active: true },
    })

    expect(agent.isToolActive).toBe(false)
  })
})
