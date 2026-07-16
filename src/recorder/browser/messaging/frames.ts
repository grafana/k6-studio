import { nanoid } from 'nanoid'
import { z } from 'zod/v4'

import {
  BoundsSchema,
  SerializedElementState,
  SerializedElementStateSchema,
} from '@/recorder/browser/serialization'
import {
  BrowserEventTarget,
  BrowserEventTargetSchema,
} from '@/schemas/recording'

type Bounds = z.infer<typeof BoundsSchema>

const PROTOCOL_SOURCE = 'k6-studio-frames'
const PROTOCOL_VERSION = 1

const FramePathRequestSchema = z.object({
  type: z.literal('frame-path-request'),
  id: z.string(),
})

const FramePathResponseSchema = z.object({
  type: z.literal('frame-path-response'),
  id: z.string(),
  // null means the responder could not determine its own path. Propagating a
  // partial path would resolve locators in the wrong frame, so the requester
  // falls back to no frame path instead.
  path: BrowserEventTargetSchema.array().nullable(),
})

const HandshakeSchema = z.object({
  type: z.literal('handshake'),
  id: z.string(),
})

const HandshakeAckSchema = z.object({
  type: z.literal('handshake-ack'),
  id: z.string(),
  toolActive: z.boolean(),
})

const ToolStateSchema = z.object({
  type: z.literal('tool-state'),
  active: z.boolean(),
})

const OffsetSchema = z.object({
  left: z.number(),
  top: z.number(),
})

const TextSelectionPayloadSchema = z.object({
  text: z.string(),
  elements: SerializedElementStateSchema.array(),
  framePath: BrowserEventTargetSchema.array().nullable(),
  highlights: BoundsSchema.array(),
  bounds: BoundsSchema,
  offset: OffsetSchema,
})

const ElementPickPayloadSchema = z.object({
  elements: SerializedElementStateSchema.array(),
  associatedControl: SerializedElementStateSchema.nullable(),
  framePath: BrowserEventTargetSchema.array().nullable(),
  position: OffsetSchema,
  offset: OffsetSchema,
})

const TextSelectionSchema = z.object({
  type: z.literal('text-selection'),
  payload: TextSelectionPayloadSchema,
})

const ElementPickSchema = z.object({
  type: z.literal('element-pick'),
  payload: ElementPickPayloadSchema,
})

const FrameMessageSchema = z.discriminatedUnion('type', [
  FramePathRequestSchema,
  FramePathResponseSchema,
  HandshakeSchema,
  HandshakeAckSchema,
  ToolStateSchema,
  TextSelectionSchema,
  ElementPickSchema,
])

/**
 * Payload carried by a `text-selection` message, relayed from the frame where
 * the selection was made up to the top frame. `offset` accumulates each
 * intermediate frame's viewport position as the message travels upward,
 * starting at `{ left: 0, top: 0 }` in the sending frame.
 */
export interface TextSelectionPayload {
  text: string
  /** commonAncestor chain, innermost first. */
  elements: SerializedElementState[]
  framePath: BrowserEventTarget[] | null
  /** Range client rects, in the sending frame's viewport coordinates. */
  highlights: Bounds[]
  /** Range bounding rect, in the sending frame's viewport coordinates. */
  bounds: Bounds
  offset: { left: number; top: number }
}

/**
 * Payload carried by an `element-pick` message, relayed from the frame where
 * the element was picked up to the top frame. `offset` accumulates each
 * intermediate frame's viewport position as the message travels upward,
 * starting at `{ left: 0, top: 0 }` in the sending frame.
 */
export interface ElementPickPayload {
  /** Picked element chain, innermost first. */
  elements: SerializedElementState[]
  associatedControl: SerializedElementState | null
  framePath: BrowserEventTarget[] | null
  /** clientX/Y, in the sending frame's viewport coordinates. */
  position: { left: number; top: number }
  offset: { left: number; top: number }
}

/**
 * Accumulates one frame hop's viewport offset onto `offset`. Mirrors the
 * single-hop math in `getFrameOffset` (src/utils/dom/layout.ts): only the
 * iframe's bounding rect position is added, not `clientLeft`/`clientTop`.
 */
function addFrameHopOffset(
  offset: { left: number; top: number },
  iframe: Element
): { left: number; top: number } {
  const rect = iframe.getBoundingClientRect()

  return {
    left: offset.left + rect.left,
    top: offset.top + rect.top,
  }
}

const HANDSHAKE_RETRY_MS = 100
const MAX_HANDSHAKE_ATTEMPTS = 5

const FrameEnvelopeSchema = z.object({
  source: z.literal(PROTOCOL_SOURCE),
  version: z.literal(PROTOCOL_VERSION),
  message: FrameMessageSchema,
})

type FrameMessage = z.infer<typeof FrameMessageSchema>

/**
 * Fast pre-check for the protocol's envelope marker, so unrelated page
 * messages are discarded on one property read instead of a full schema parse.
 */
function isProtocolEnvelope(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    'source' in data &&
    data.source === PROTOCOL_SOURCE
  )
}

export interface FrameMessageEvent {
  data: unknown
  source: unknown
}

export interface FrameWindowLike {
  addEventListener(
    type: 'message',
    listener: (event: FrameMessageEvent) => void
  ): void
  removeEventListener(
    type: 'message',
    listener: (event: FrameMessageEvent) => void
  ): void
}

export interface FrameRef {
  element: Element
  contentWindow: unknown
}

export interface FrameAgentOptions {
  win: FrameWindowLike
  /** The window to send requests to, or null when running in the top frame. */
  parentWindow: unknown
  /** The frame elements of this frame's document, used to match `event.source`. */
  getFrames: () => FrameRef[]
  /** Locator details for one of this frame's own iframe elements. */
  getIframeLocator: (iframe: Element) => BrowserEventTarget
  /** This frame's own path, used when answering a child's request. */
  getOwnPath: () => Promise<BrowserEventTarget[] | null>
  /** Injectable for tests; defaults to postMessage with targetOrigin '*'. */
  send?: (target: unknown, envelope: unknown) => void
  requestTimeoutMs?: number
}

const DEFAULT_REQUEST_TIMEOUT_MS = 1000

interface PostMessageTarget {
  postMessage(message: unknown, targetOrigin: string): void
}

function isPostMessageTarget(target: unknown): target is PostMessageTarget {
  return (
    typeof target === 'object' &&
    target !== null &&
    typeof (target as PostMessageTarget).postMessage === 'function'
  )
}

// A cross-origin WindowProxy fails `instanceof Window` silently, because its
// prototype chain is inaccessible cross-origin. Checking for postMessage
// structurally works for both same-origin windows and cross-origin proxies.
function defaultSend(target: unknown, envelope: unknown) {
  if (isPostMessageTarget(target)) {
    target.postMessage(envelope, '*')
  }
}

interface PendingRequest {
  resolve: (path: BrowserEventTarget[] | null) => void
  timeout: ReturnType<typeof setTimeout>
}

/**
 * Cross-origin frame coordination over postMessage. Same-origin frames keep
 * using the synchronous walks and bridges; this protocol is the fallback for
 * frames where those throw. The envelope filter guards against accidental
 * collisions with page messages, not against a hostile page.
 */
export class FrameAgent {
  #options: FrameAgentOptions
  #send: (target: unknown, envelope: unknown) => void
  #requestTimeoutMs: number
  #pending = new Map<string, PendingRequest>()
  #toolActive = false
  #handshakeId: string | null = null
  #handshakeTimer: ReturnType<typeof setTimeout> | null = null
  #textSelectionListeners = new Set<(payload: TextSelectionPayload) => void>()
  #elementPickListeners = new Set<(payload: ElementPickPayload) => void>()

  #handleMessage = (event: FrameMessageEvent) => {
    // This listener sees every postMessage the page receives (ads, widgets,
    // analytics), so bail on a single property read before paying for full
    // schema validation of unrelated traffic.
    if (!isProtocolEnvelope(event.data)) {
      return
    }

    const parsed = FrameEnvelopeSchema.safeParse(event.data)

    if (!parsed.success) {
      return
    }

    this.#dispatch(parsed.data.message, event.source)
  }

  constructor(options: FrameAgentOptions) {
    this.#options = options
    this.#send = options.send ?? defaultSend
    this.#requestTimeoutMs =
      options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS

    options.win.addEventListener('message', this.#handleMessage)
  }

  get isToolActive(): boolean {
    return this.#toolActive
  }

  /**
   * Announces this frame to its parent, retrying with backoff until the
   * parent's agent acknowledges (covers the child-before-parent init race).
   * The ack carries the current tool state.
   */
  announce() {
    if (this.#options.parentWindow === null) {
      return
    }

    this.#handshakeId = nanoid()
    this.#sendHandshake(0)
  }

  /**
   * Caches the tool state and pushes it to all direct child frames. Used by
   * the top frame on tool changes and by child frames to relay downward.
   */
  broadcastToolState(active: boolean) {
    this.#toolActive = active

    this.#options.getFrames().forEach((frame) => {
      this.#post(frame.contentWindow, { type: 'tool-state', active })
    })
  }

  requestFramePath(): Promise<BrowserEventTarget[] | null> {
    if (this.#options.parentWindow === null) {
      return Promise.resolve([])
    }

    const id = nanoid()

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.#pending.delete(id)
        resolve(null)
      }, this.#requestTimeoutMs)

      this.#pending.set(id, { resolve, timeout })

      this.#post(this.#options.parentWindow, {
        type: 'frame-path-request',
        id,
      })
    })
  }

  /**
   * Sends a text selection made in this frame toward the top frame, starting
   * with a zero offset. A no-op in the top frame: there is no parent to send
   * to, and the top frame delivers payloads to listeners instead of sending.
   */
  sendTextSelection(payload: Omit<TextSelectionPayload, 'offset'>) {
    if (this.#options.parentWindow === null) {
      return
    }

    this.#post(this.#options.parentWindow, {
      type: 'text-selection',
      payload: { ...payload, offset: { left: 0, top: 0 } },
    })
  }

  /**
   * Sends an element pick made in this frame toward the top frame, starting
   * with a zero offset. A no-op in the top frame, for the same reason as
   * {@link sendTextSelection}.
   */
  sendElementPick(payload: Omit<ElementPickPayload, 'offset'>) {
    if (this.#options.parentWindow === null) {
      return
    }

    this.#post(this.#options.parentWindow, {
      type: 'element-pick',
      payload: { ...payload, offset: { left: 0, top: 0 } },
    })
  }

  /** Registers a listener for text selections relayed up to the top frame. */
  onTextSelection(listener: (payload: TextSelectionPayload) => void) {
    this.#textSelectionListeners.add(listener)

    return () => {
      this.#textSelectionListeners.delete(listener)
    }
  }

  /** Registers a listener for element picks relayed up to the top frame. */
  onElementPick(listener: (payload: ElementPickPayload) => void) {
    this.#elementPickListeners.add(listener)

    return () => {
      this.#elementPickListeners.delete(listener)
    }
  }

  dispose() {
    this.#options.win.removeEventListener('message', this.#handleMessage)

    this.#pending.forEach(({ resolve, timeout }) => {
      clearTimeout(timeout)
      resolve(null)
    })

    this.#pending.clear()
    this.#textSelectionListeners.clear()
    this.#elementPickListeners.clear()

    if (this.#handshakeTimer !== null) {
      clearTimeout(this.#handshakeTimer)
      this.#handshakeTimer = null
    }
  }

  #post(target: unknown, message: FrameMessage) {
    this.#send(target, {
      source: PROTOCOL_SOURCE,
      version: PROTOCOL_VERSION,
      message,
    })
  }

  #sendHandshake(attempt: number) {
    if (this.#handshakeId === null || attempt >= MAX_HANDSHAKE_ATTEMPTS) {
      return
    }

    this.#post(this.#options.parentWindow, {
      type: 'handshake',
      id: this.#handshakeId,
    })

    this.#handshakeTimer = setTimeout(
      () => {
        this.#sendHandshake(attempt + 1)
      },
      HANDSHAKE_RETRY_MS * 2 ** attempt
    )
  }

  /** The child frame whose contentWindow sent a message, if it is ours. */
  #findChildFrame(source: unknown): FrameRef | undefined {
    return this.#options
      .getFrames()
      .find((candidate) => candidate.contentWindow === source)
  }

  #dispatch(message: FrameMessage, source: unknown) {
    switch (message.type) {
      case 'frame-path-response': {
        if (source !== this.#options.parentWindow) {
          return
        }

        const pending = this.#pending.get(message.id)

        if (pending === undefined) {
          return
        }

        clearTimeout(pending.timeout)
        this.#pending.delete(message.id)
        pending.resolve(message.path)

        return
      }

      case 'frame-path-request': {
        const frame = this.#findChildFrame(source)

        if (frame === undefined) {
          return
        }

        // Any failure (getOwnPath rejecting or the locator computation
        // throwing, e.g. on a detached iframe) still answers with a null
        // path, so the child falls back immediately instead of stalling
        // its full request timeout.
        void this.#options
          .getOwnPath()
          .then((ownPath) =>
            ownPath === null
              ? null
              : [...ownPath, this.#options.getIframeLocator(frame.element)]
          )
          .catch(() => null)
          .then((path) => {
            this.#post(source, {
              type: 'frame-path-response',
              id: message.id,
              path,
            })
          })

        return
      }

      case 'handshake': {
        if (this.#findChildFrame(source) === undefined) {
          return
        }

        this.#post(source, {
          type: 'handshake-ack',
          id: message.id,
          toolActive: this.#toolActive,
        })

        return
      }

      case 'handshake-ack': {
        if (
          source !== this.#options.parentWindow ||
          message.id !== this.#handshakeId
        ) {
          return
        }

        this.#handshakeId = null

        if (this.#handshakeTimer !== null) {
          clearTimeout(this.#handshakeTimer)
          this.#handshakeTimer = null
        }

        this.broadcastToolState(message.toolActive)

        return
      }

      case 'tool-state': {
        if (source !== this.#options.parentWindow) {
          return
        }

        this.broadcastToolState(message.active)

        return
      }

      case 'text-selection': {
        const frame = this.#findChildFrame(source)

        if (frame === undefined) {
          return
        }

        const payload: TextSelectionPayload = {
          ...message.payload,
          offset: addFrameHopOffset(message.payload.offset, frame.element),
        }

        if (this.#options.parentWindow === null) {
          this.#textSelectionListeners.forEach((listener) => listener(payload))

          return
        }

        this.#post(this.#options.parentWindow, {
          type: 'text-selection',
          payload,
        })

        return
      }

      case 'element-pick': {
        const frame = this.#findChildFrame(source)

        if (frame === undefined) {
          return
        }

        const payload: ElementPickPayload = {
          ...message.payload,
          offset: addFrameHopOffset(message.payload.offset, frame.element),
        }

        if (this.#options.parentWindow === null) {
          this.#elementPickListeners.forEach((listener) => listener(payload))

          return
        }

        this.#post(this.#options.parentWindow, {
          type: 'element-pick',
          payload,
        })

        return
      }
    }
  }
}

let installedAgent: FrameAgent | null = null

export function installFrameAgent(agent: FrameAgent | null) {
  installedAgent = agent
}

export function getFrameAgent(): FrameAgent | null {
  return installedAgent
}
