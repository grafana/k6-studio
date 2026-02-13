import { describe, expect, it } from 'vitest'

import { extractSSEEvents } from './sseParser'
import type { ActiveA2ASession } from './types'

function createSession(buffer = ''): ActiveA2ASession {
  return {
    sseBuffer: buffer,
    reader: undefined as unknown as ReadableStreamDefaultReader<Uint8Array>,
    contextId: undefined,
    taskId: undefined,
    sessionAbortController: new AbortController(),
    pendingToolRequests: new Map(),
    unmatchedToolCalls: [],
    unmatchedRemoteRequests: [],
    readyToFinishForTools: false,
  }
}

describe('extractSSEEvents', () => {
  it('parses a single complete event', () => {
    const session = createSession(
      'data: {"jsonrpc":"2.0","id":1,"result":{"kind":"status-update","taskId":"t1","contextId":"c1","status":{"state":"working"}}}\n\n'
    )

    const events = extractSSEEvents(session)

    expect(events).toHaveLength(1)
    expect(events[0]?.jsonrpc).toBe('2.0')
    expect(session.sseBuffer).toBe('')
  })

  it('parses multiple events in one buffer', () => {
    const event1 =
      '{"jsonrpc":"2.0","id":1,"result":{"kind":"status-update","taskId":"t1","contextId":"c1","status":{"state":"working"}}}'
    const event2 =
      '{"jsonrpc":"2.0","id":2,"result":{"kind":"status-update","taskId":"t1","contextId":"c1","status":{"state":"completed"}}}'

    const session = createSession(`data: ${event1}\n\ndata: ${event2}\n\n`)

    const events = extractSSEEvents(session)

    expect(events).toHaveLength(2)
  })

  it('keeps incomplete events in the buffer', () => {
    const session = createSession('data: {"jsonrpc":"2.0","id":1}')

    const events = extractSSEEvents(session)

    expect(events).toHaveLength(0)
    expect(session.sseBuffer).toBe('data: {"jsonrpc":"2.0","id":1}')
  })

  it('joins multi-line data fields', () => {
    const session = createSession(
      'data: {"jsonrpc":"2.0",\ndata: "id":1,"result":null}\n\n'
    )

    const events = extractSSEEvents(session)

    expect(events).toHaveLength(1)
    expect(events[0]?.id).toBe(1)
  })

  it('skips malformed JSON gracefully', () => {
    const session = createSession(
      'data: not-json\n\ndata: {"jsonrpc":"2.0","id":2,"result":null}\n\n'
    )

    const events = extractSSEEvents(session)

    expect(events).toHaveLength(1)
    expect(events[0]?.id).toBe(2)
  })

  it('returns empty array for empty buffer', () => {
    const session = createSession('')
    const events = extractSSEEvents(session)
    expect(events).toHaveLength(0)
  })

  it('handles mixed complete and incomplete events', () => {
    const session = createSession(
      'data: {"jsonrpc":"2.0","id":1,"result":null}\n\ndata: {"incomplete'
    )

    const events = extractSSEEvents(session)

    expect(events).toHaveLength(1)
    expect(session.sseBuffer).toBe('data: {"incomplete')
  })
})
