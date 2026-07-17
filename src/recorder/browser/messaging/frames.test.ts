import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BrowserEventTarget } from '@/schemas/recording'

import {
  ElementPickPayload,
  FrameAgent,
  FrameMessageEvent,
  TextSelectionPayload,
} from './frames'

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

const envelope = (message: unknown) => ({
  source: 'k6-studio-frames',
  version: 1,
  message,
})

/**
 * Fake iframe element for offset relay tests. `clientLeft`/`clientTop` are
 * non-zero and deliberately excluded from the expected offsets in the tests
 * below, matching `getFrameOffset` (src/utils/dom/layout.ts), which only
 * accumulates `getBoundingClientRect().left`/`.top` per hop.
 */
function fakeIframeElement(rect: { left: number; top: number }): Element {
  return {
    getBoundingClientRect: () =>
      ({
        left: rect.left,
        top: rect.top,
        width: 0,
        height: 0,
        right: rect.left,
        bottom: rect.top,
        x: rect.left,
        y: rect.top,
      }) as DOMRect,
    clientLeft: 3,
    clientTop: 4,
  } as unknown as Element
}

const textSelectionPayload = (): Omit<TextSelectionPayload, 'offset'> => ({
  text: 'hello world',
  elements: [],
  framePath: null,
  highlights: [{ top: 0, left: 0, width: 10, height: 10 }],
  bounds: { top: 0, left: 0, width: 10, height: 10 },
})

const elementPickPayload = (): Omit<ElementPickPayload, 'offset'> => ({
  elements: [],
  associatedControl: null,
  framePath: null,
  position: { left: 3, top: 4 },
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

    const [requestEnvelope] = sent as [
      { message: { type: string; id: string } },
    ]

    expect(requestEnvelope.message.type).toBe('frame-path-request')

    win.deliverFrom(
      parentWin,
      envelope({
        type: 'frame-path-response',
        id: requestEnvelope.message.id,
        path: [locator('iframe#outer')],
      })
    )

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

    const [sentEnvelope] = sent as [{ message: { id: string } }]

    win.deliverFrom(
      intruder,
      envelope({
        type: 'frame-path-response',
        id: sentEnvelope.message.id,
        path: [locator('iframe#evil')],
      })
    )

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
    getIframeLocator?: (iframe: Element) => BrowserEventTarget
  }) {
    const childWin = new FakeFrameWindow()
    const iframeElement = { id: 'child-iframe' } as unknown as Element

    const { win: parentWin } = createAgent({
      getFrames: () => [{ element: iframeElement, contentWindow: childWin }],
      getIframeLocator:
        parentSetup.getIframeLocator ?? (() => locator('iframe#child')),
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
      envelope({
        type: 'frame-path-response',
        id: 'req-1',
        path: [locator('iframe#outer'), locator('iframe#child')],
      }),
    ])
  })

  it('responds with a null path when its own path is unknown', async () => {
    const { parentWin, childWin } = linkChild({
      getOwnPath: () => Promise.resolve(null),
    })

    const received = requestFromChild(parentWin, childWin)

    await vi.runAllTimersAsync()

    expect(received).toEqual([
      envelope({ type: 'frame-path-response', id: 'req-1', path: null }),
    ])
  })

  it('ignores requests from windows that are not its own frames', async () => {
    const { parentWin, childWin } = linkChild({})
    const intruder = new FakeFrameWindow()

    const received: unknown[] = []
    childWin.addEventListener('message', (event) => received.push(event.data))

    parentWin.deliverFrom(
      intruder,
      envelope({ type: 'frame-path-request', id: 'req-1' })
    )

    await vi.runAllTimersAsync()

    expect(received).toEqual([])
  })

  it('responds with a null path when computing the iframe locator throws', async () => {
    const { parentWin, childWin } = linkChild({
      getOwnPath: () => Promise.resolve([locator('iframe#outer')]),
      getIframeLocator: () => {
        throw new Error('detached iframe')
      },
    })

    const received = requestFromChild(parentWin, childWin)

    await vi.runAllTimersAsync()

    expect(received).toEqual([
      envelope({ type: 'frame-path-response', id: 'req-1', path: null }),
    ])
  })

  it('responds with a null path when getOwnPath rejects', async () => {
    const { parentWin, childWin } = linkChild({
      getOwnPath: () => Promise.reject(new Error('boom')),
    })

    const received = requestFromChild(parentWin, childWin)

    await vi.runAllTimersAsync()

    expect(received).toEqual([
      envelope({ type: 'frame-path-response', id: 'req-1', path: null }),
    ])
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

    win.deliverFrom(
      parentWin,
      envelope({
        type: 'handshake-ack',
        id: sent[1]?.message.id ?? '',
        toolActive: true,
      })
    )

    expect(agent.isToolActive).toBe(true)

    // Acked: no further retries.
    vi.advanceTimersByTime(10_000)

    expect(sent).toHaveLength(2)
  })

  it('continues slow handshake retries after the initial attempt limit until acknowledged', () => {
    const parentWin = new FakeFrameWindow()
    const { win, agent } = createAgent({ parentWindow: parentWin })

    const sent: Array<{ message: { type: string; id: string } }> = []
    parentWin.addEventListener('message', (event) => {
      sent.push(event.data as { message: { type: string; id: string } })
    })

    agent.announce()

    vi.advanceTimersByTime(60_000)

    expect(sent.length).toBeGreaterThan(5)

    win.deliverFrom(
      parentWin,
      envelope({
        type: 'handshake-ack',
        id: sent[0]?.message.id ?? '',
        toolActive: true,
      })
    )

    const countAfterAck = sent.length

    vi.advanceTimersByTime(60_000)

    expect(sent.length).toBe(countAfterAck)
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

    parentWin.deliverFrom(childWin, envelope({ type: 'handshake', id: 'hs-1' }))

    expect(received).toContainEqual(
      envelope({ type: 'handshake-ack', id: 'hs-1', toolActive: true })
    )
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

    win.deliverFrom(parentWin, envelope({ type: 'tool-state', active: true }))

    expect(agent.isToolActive).toBe(true)
    expect(relayed).toEqual([envelope({ type: 'tool-state', active: true })])
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

    win.deliverFrom(
      parentWin,
      envelope({
        type: 'handshake-ack',
        id: sent[0]?.message.id ?? '',
        toolActive: true,
      })
    )

    expect(agent.isToolActive).toBe(true)
    expect(relayed).toEqual([envelope({ type: 'tool-state', active: true })])
  })

  it('ignores tool-state that does not come from the parent', () => {
    const parentWin = new FakeFrameWindow()
    const intruder = new FakeFrameWindow()
    const { win, agent } = createAgent({ parentWindow: parentWin })

    win.deliverFrom(intruder, envelope({ type: 'tool-state', active: true }))

    expect(agent.isToolActive).toBe(false)
  })
})

describe('FrameAgent text-selection and element-pick relay', () => {
  it('accumulates the offset over two hops and delivers the payload once to the top listener', () => {
    const topWin = new FakeFrameWindow()
    const middleWin = new FakeFrameWindow()
    const grandchildWin = new FakeFrameWindow()

    const middleIframeElement = fakeIframeElement({ left: 10, top: 20 })
    const grandchildIframeElement = fakeIframeElement({ left: 5, top: 7 })

    const topAgent = new FrameAgent({
      win: topWin,
      parentWindow: null,
      getFrames: () => [
        { element: middleIframeElement, contentWindow: middleWin },
      ],
      getIframeLocator: () => locator('iframe#unused'),
      getOwnPath: () => Promise.resolve([]),
      send: sendFrom(topWin),
    })

    const middleAgent = new FrameAgent({
      win: middleWin,
      parentWindow: topWin,
      getFrames: () => [
        { element: grandchildIframeElement, contentWindow: grandchildWin },
      ],
      getIframeLocator: () => locator('iframe#unused'),
      getOwnPath: () => Promise.resolve([]),
      send: sendFrom(middleWin),
    })

    const grandchildAgent = new FrameAgent({
      win: grandchildWin,
      parentWindow: middleWin,
      getFrames: () => [],
      getIframeLocator: () => locator('iframe#unused'),
      getOwnPath: () => Promise.resolve([]),
      send: sendFrom(grandchildWin),
    })

    const received: TextSelectionPayload[] = []
    topAgent.onTextSelection((payload) => received.push(payload))

    grandchildAgent.sendTextSelection(textSelectionPayload())

    // Hand-computed: grandchild hop (left: 5, top: 7) + middle hop
    // (left: 10, top: 20), clientLeft/clientTop excluded.
    expect(received).toEqual([
      { ...textSelectionPayload(), offset: { left: 15, top: 27 } },
    ])

    topAgent.dispose()
    middleAgent.dispose()
    grandchildAgent.dispose()
  })

  it('accumulates the offset for a single hop when relaying an element pick', () => {
    const childWin = new FakeFrameWindow()
    const iframeElement = fakeIframeElement({ left: 8, top: 3 })

    const { win, agent } = createAgent({
      getFrames: () => [{ element: iframeElement, contentWindow: childWin }],
    })

    const received: ElementPickPayload[] = []
    agent.onElementPick((payload) => received.push(payload))

    win.deliverFrom(
      childWin,
      envelope({
        type: 'element-pick',
        payload: { ...elementPickPayload(), offset: { left: 0, top: 0 } },
      })
    )

    expect(received).toEqual([
      { ...elementPickPayload(), offset: { left: 8, top: 3 } },
    ])
  })

  it('reposts a text-selection message upward, adding its own hop, when it has a parent', () => {
    const parentWin = new FakeFrameWindow()
    const childWin = new FakeFrameWindow()
    const iframeElement = fakeIframeElement({ left: 6, top: 9 })

    const { win } = createAgent({
      parentWindow: parentWin,
      getFrames: () => [{ element: iframeElement, contentWindow: childWin }],
    })

    const sent: unknown[] = []
    parentWin.addEventListener('message', (event) => sent.push(event.data))

    win.deliverFrom(
      childWin,
      envelope({
        type: 'text-selection',
        payload: { ...textSelectionPayload(), offset: { left: 1, top: 2 } },
      })
    )

    expect(sent).toEqual([
      envelope({
        type: 'text-selection',
        payload: {
          ...textSelectionPayload(),
          offset: { left: 7, top: 11 },
        },
      }),
    ])
  })

  it('ignores a text-selection relay from a window that is not a matched child frame', () => {
    const childWin = new FakeFrameWindow()
    const intruder = new FakeFrameWindow()
    const iframeElement = fakeIframeElement({ left: 10, top: 20 })

    const { win, agent } = createAgent({
      getFrames: () => [{ element: iframeElement, contentWindow: childWin }],
    })

    const received: TextSelectionPayload[] = []
    agent.onTextSelection((payload) => received.push(payload))

    win.deliverFrom(
      intruder,
      envelope({
        type: 'text-selection',
        payload: { ...textSelectionPayload(), offset: { left: 0, top: 0 } },
      })
    )

    expect(received).toEqual([])
  })

  it('ignores an element-pick relay from a window that is not a matched child frame', () => {
    const childWin = new FakeFrameWindow()
    const intruder = new FakeFrameWindow()
    const iframeElement = fakeIframeElement({ left: 10, top: 20 })

    const { win, agent } = createAgent({
      getFrames: () => [{ element: iframeElement, contentWindow: childWin }],
    })

    const received: ElementPickPayload[] = []
    agent.onElementPick((payload) => received.push(payload))

    win.deliverFrom(
      intruder,
      envelope({
        type: 'element-pick',
        payload: { ...elementPickPayload(), offset: { left: 0, top: 0 } },
      })
    )

    expect(received).toEqual([])
  })

  it('stops delivering element-pick payloads to a listener after it unsubscribes', () => {
    const childWin = new FakeFrameWindow()
    const iframeElement = fakeIframeElement({ left: 1, top: 2 })

    const { win, agent } = createAgent({
      getFrames: () => [{ element: iframeElement, contentWindow: childWin }],
    })

    const received: ElementPickPayload[] = []
    const unsubscribe = agent.onElementPick((payload) => received.push(payload))

    const deliver = () =>
      win.deliverFrom(
        childWin,
        envelope({
          type: 'element-pick',
          payload: { ...elementPickPayload(), offset: { left: 0, top: 0 } },
        })
      )

    deliver()

    expect(received).toHaveLength(1)

    unsubscribe()
    deliver()

    expect(received).toHaveLength(1)
  })

  it('allows multiple listeners to receive the same text-selection payload', () => {
    const childWin = new FakeFrameWindow()
    const iframeElement = fakeIframeElement({ left: 1, top: 2 })

    const { win, agent } = createAgent({
      getFrames: () => [{ element: iframeElement, contentWindow: childWin }],
    })

    const receivedByFirst: TextSelectionPayload[] = []
    const receivedBySecond: TextSelectionPayload[] = []
    agent.onTextSelection((payload) => receivedByFirst.push(payload))
    agent.onTextSelection((payload) => receivedBySecond.push(payload))

    win.deliverFrom(
      childWin,
      envelope({
        type: 'text-selection',
        payload: { ...textSelectionPayload(), offset: { left: 0, top: 0 } },
      })
    )

    expect(receivedByFirst).toHaveLength(1)
    expect(receivedBySecond).toHaveLength(1)
  })

  it('does not send anything when sendTextSelection/sendElementPick are called in the top frame', () => {
    const sendSpy = vi.fn()
    const agent = new FrameAgent({
      win: new FakeFrameWindow(),
      parentWindow: null,
      getFrames: () => [],
      getIframeLocator: () => locator('iframe#unused'),
      getOwnPath: () => Promise.resolve([]),
      send: sendSpy,
    })

    agent.sendTextSelection(textSelectionPayload())
    agent.sendElementPick(elementPickPayload())

    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('posts a text-selection message to the parent with a zero offset', () => {
    const parentWin = new FakeFrameWindow()
    const { agent } = createAgent({ parentWindow: parentWin })

    const sent: unknown[] = []
    parentWin.addEventListener('message', (event) => sent.push(event.data))

    agent.sendTextSelection(textSelectionPayload())

    expect(sent).toEqual([
      envelope({
        type: 'text-selection',
        payload: { ...textSelectionPayload(), offset: { left: 0, top: 0 } },
      }),
    ])
  })

  it('posts an element-pick message to the parent with a zero offset', () => {
    const parentWin = new FakeFrameWindow()
    const { agent } = createAgent({ parentWindow: parentWin })

    const sent: unknown[] = []
    parentWin.addEventListener('message', (event) => sent.push(event.data))

    agent.sendElementPick(elementPickPayload())

    expect(sent).toEqual([
      envelope({
        type: 'element-pick',
        payload: { ...elementPickPayload(), offset: { left: 0, top: 0 } },
      }),
    ])
  })
})
