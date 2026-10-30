import {
  EventType,
  IncrementalSource,
  type eventWithTime,
  type mutationCallbackParam,
} from '@rrweb/types'
import { record } from 'rrweb'

declare global {
  interface Window {
    __K6_REPLAY_OWNER_READY__?: (iframe: HTMLIFrameElement) => boolean
  }
}

const TOKEN_MESSAGE_TYPES = [
  'k6-replay-request',
  'k6-replay-start',
  'k6-replay-snapshot',
  'k6-replay-accepted',
] as const

type FrameMessage =
  | { type: (typeof TOKEN_MESSAGE_TYPES)[number]; token: string }
  | { type: 'k6-replay-recheck' }

function isFrameMessage(value: unknown): value is FrameMessage {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false
  }

  if (value.type === 'k6-replay-recheck') {
    return true
  }

  return (
    TOKEN_MESSAGE_TYPES.some((type) => type === value.type) &&
    'token' in value &&
    typeof value.token === 'string'
  )
}

interface FrameReadinessOptions {
  token: string
  topLevelFrame: boolean
  startChildRecording: (
    onMutation: (data: mutationCallbackParam) => void
  ) => void
}

export function createReplayFrameReadiness({
  token,
  topLevelFrame,
  startChildRecording,
}: FrameReadinessOptions) {
  const canReadParent = (() => {
    try {
      return !topLevelFrame && Boolean(window.parent.document)
    } catch {
      return false
    }
  })()
  const requests = new WeakMap<Window, { token: string; started: boolean }>()
  let recordingStarted = topLevelFrame
  let ready = false
  let recheckQueued = false

  function ownerReady(iframe: HTMLIFrameElement): boolean {
    if (recordingStarted && !canReadParent) {
      return record.mirror.getId(iframe) !== -1
    }

    try {
      return window.parent.__K6_REPLAY_OWNER_READY__?.(iframe) ?? false
    } catch {
      return false
    }
  }

  function childFrames(
    root: Document | ShadowRoot = document
  ): HTMLIFrameElement[] {
    return [
      ...root.querySelectorAll('iframe'),
      ...[...root.querySelectorAll('*')].flatMap((element) =>
        element.shadowRoot ? childFrames(element.shadowRoot) : []
      ),
    ]
  }

  function tryStart(iframe: HTMLIFrameElement) {
    const child = iframe.contentWindow
    const request = child && requests.get(child)

    if (!child || !request || request.started || !ownerReady(iframe)) {
      return
    }

    request.started = true
    child.postMessage({ type: 'k6-replay-start', token: request.token }, '*')
  }

  function recheckChildren() {
    if (!ready) {
      return
    }

    childFrames().forEach((iframe) => {
      tryStart(iframe)
      iframe.contentWindow?.postMessage({ type: 'k6-replay-recheck' }, '*')
    })
  }

  function markReady() {
    ready = true
    recheckChildren()
  }

  function queueRecheck() {
    if (recheckQueued) return
    recheckQueued = true
    // rrweb calls mutation hooks before emitting the serialized nodes.
    queueMicrotask(() => {
      recheckQueued = false
      recheckChildren()
    })
  }

  function requestStart() {
    window.parent.postMessage({ type: 'k6-replay-request', token }, '*')
  }

  function startChild() {
    if (recordingStarted) {
      return
    }

    recordingStarted = true
    startChildRecording((data) => {
      if (data.adds.length > 0) queueRecheck()
    })

    if (canReadParent) {
      markReady()
      return
    }

    const announceSnapshot = () => {
      if (record.mirror.getId(document) !== -1) {
        window.parent.postMessage({ type: 'k6-replay-snapshot', token }, '*')
      }
    }

    announceSnapshot()
    document.addEventListener('DOMContentLoaded', announceSnapshot, {
      once: true,
    })
  }

  function findOwner(source: MessageEventSource | null) {
    return childFrames().find((iframe) => iframe.contentWindow === source)
  }

  function handleRequest(
    source: MessageEventSource | null,
    childToken: string
  ) {
    const owner = findOwner(source)
    const child = owner?.contentWindow

    if (!owner || !child) {
      return
    }

    requests.set(child, { token: childToken, started: false })
    if (ready) {
      tryStart(owner)
    }
  }

  function handleSnapshot(
    source: MessageEventSource | null,
    childToken: string
  ) {
    const owner = findOwner(source)
    const child = owner?.contentWindow

    if (
      !owner ||
      !child ||
      !ownerReady(owner) ||
      requests.get(child)?.token !== childToken
    ) {
      return
    }

    // The control message follows rrweb's full snapshot to the same parent.
    child.postMessage({ type: 'k6-replay-accepted', token: childToken }, '*')
  }

  function handleMessage(event: MessageEvent<unknown>) {
    if (!isFrameMessage(event.data)) {
      return
    }

    const message = event.data

    if (message.type === 'k6-replay-request') {
      handleRequest(event.source, message.token)
      return
    }
    if (message.type === 'k6-replay-snapshot') {
      handleSnapshot(event.source, message.token)
      return
    }
    if (event.source !== window.parent) return
    if (message.type === 'k6-replay-recheck') {
      if (recordingStarted) queueRecheck()
      else requestStart()
      return
    }
    if (message.token !== token) return
    if (message.type === 'k6-replay-start') startChild()
    else markReady()
  }

  window.__K6_REPLAY_OWNER_READY__ = ownerReady
  window.addEventListener('message', handleMessage)

  if (!topLevelFrame) {
    requestStart()
  }

  return {
    onTopEvent(event: eventWithTime) {
      if (event.type === EventType.FullSnapshot) {
        markReady()
      } else if (
        event.type === EventType.IncrementalSnapshot &&
        event.data.source === IncrementalSource.Mutation &&
        event.data.adds.length > 0
      ) {
        // Emitted events also include same-origin document attachments, unlike hooks.
        queueRecheck()
      }
    },
  }
}
