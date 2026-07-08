import { nanoid } from 'nanoid'
import { z } from 'zod/v4'

import {
  BrowserEventTarget,
  BrowserEventTargetSchema,
} from '@/schemas/recording'

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

const FrameMessageSchema = z.discriminatedUnion('type', [
  FramePathRequestSchema,
  FramePathResponseSchema,
])

const FrameEnvelopeSchema = z.object({
  source: z.literal(PROTOCOL_SOURCE),
  version: z.literal(PROTOCOL_VERSION),
  message: FrameMessageSchema,
})

type FrameMessage = z.infer<typeof FrameMessageSchema>

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

function defaultSend(target: unknown, envelope: unknown) {
  if (target instanceof Window) {
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

  #handleMessage = (event: FrameMessageEvent) => {
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

  dispose() {
    this.#options.win.removeEventListener('message', this.#handleMessage)

    this.#pending.forEach(({ resolve, timeout }) => {
      clearTimeout(timeout)
      resolve(null)
    })

    this.#pending.clear()
  }

  #post(target: unknown, message: FrameMessage) {
    this.#send(target, {
      source: PROTOCOL_SOURCE,
      version: PROTOCOL_VERSION,
      message,
    })
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
        const frame = this.#options
          .getFrames()
          .find((candidate) => candidate.contentWindow === source)

        if (frame === undefined) {
          return
        }

        void this.#options.getOwnPath().then((ownPath) => {
          const path =
            ownPath === null
              ? null
              : [...ownPath, this.#options.getIframeLocator(frame.element)]

          this.#post(source, {
            type: 'frame-path-response',
            id: message.id,
            path,
          })
        })

        return
      }
    }
  }
}
