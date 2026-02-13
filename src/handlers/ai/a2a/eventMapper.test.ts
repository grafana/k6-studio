import { describe, expect, it, vi } from 'vitest'

import { processA2AEvent } from './eventMapper'
import type { A2ASSEEvent, ActiveA2ASession } from './types'

vi.mock('electron-log/main', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

function createSession(
  overrides?: Partial<ActiveA2ASession>
): ActiveA2ASession {
  return {
    reader: undefined as unknown as ReadableStreamDefaultReader<Uint8Array>,
    contextId: undefined,
    taskId: undefined,
    sessionAbortController: new AbortController(),
    pendingToolRequests: new Map(),
    unmatchedToolCalls: [],
    unmatchedRemoteRequests: [],
    sseBuffer: '',
    readyToFinishForTools: false,
    ...overrides,
  }
}

describe('processA2AEvent', () => {
  it('returns error part for JSON-RPC errors', () => {
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32600, message: 'Invalid request' },
    }

    const parts = processA2AEvent(event, createSession())

    expect(parts).toHaveLength(1)
    expect(parts[0]?.type).toBe('error')
  })

  it('returns empty for status-update(working)', () => {
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        kind: 'status-update',
        taskId: 't1',
        contextId: 'c1',
        status: { state: 'working' },
      },
    }

    const parts = processA2AEvent(event, createSession())
    expect(parts).toHaveLength(0)
  })

  it('returns finish(stop) for status-update(completed)', () => {
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        kind: 'status-update',
        taskId: 't1',
        contextId: 'c1',
        status: { state: 'completed' },
      },
    }

    const parts = processA2AEvent(event, createSession())

    expect(parts).toHaveLength(1)
    expect(parts[0]).toEqual(
      expect.objectContaining({ type: 'finish', finishReason: 'stop' })
    )
  })

  it('returns error for status-update(failed)', () => {
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        kind: 'status-update',
        taskId: 't1',
        contextId: 'c1',
        status: { state: 'failed' },
      },
    }

    const parts = processA2AEvent(event, createSession())

    expect(parts).toHaveLength(1)
    expect(parts[0]?.type).toBe('error')
  })

  it('includes status message text in failed error', () => {
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        kind: 'status-update',
        taskId: 't1',
        contextId: 'c1',
        status: {
          state: 'failed',
          message: { parts: [{ text: 'Rate limit exceeded' }] },
        },
      },
    }

    const parts = processA2AEvent(event, createSession())
    const error = (parts[0] as { type: 'error'; error: Error }).error

    expect(error.message).toBe('Rate limit exceeded')
  })

  it('updates session taskId and contextId on status-update', () => {
    const session = createSession()
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        kind: 'status-update',
        taskId: 'new-task',
        contextId: 'new-ctx',
        status: { state: 'working' },
      },
    }

    processA2AEvent(event, session)

    expect(session.taskId).toBe('new-task')
    expect(session.contextId).toBe('new-ctx')
  })

  it('returns tool-call for step.toolCall artifact', () => {
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        kind: 'artifact-update',
        taskId: 't1',
        contextId: 'c1',
        artifact: {
          name: 'step.toolCall',
          artifactId: 'art-1',
          parts: [
            {
              kind: 'data',
              data: {
                toolId: 'tool-1',
                toolName: 'searchRequests',
                inputs: { query: 'login' },
              },
            },
          ],
        },
      },
    }

    const parts = processA2AEvent(event, createSession())

    expect(parts).toHaveLength(1)
    expect(parts[0]).toEqual({
      type: 'tool-call',
      toolCallId: 'tool-1',
      toolName: 'searchRequests',
      input: '{"query":"login"}',
    })
  })

  it('returns empty for step.complete with stopReason=tool_use', () => {
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        kind: 'artifact-update',
        taskId: 't1',
        contextId: 'c1',
        artifact: {
          name: 'step.complete',
          artifactId: 'art-1',
          parts: [{ kind: 'data', data: { stopReason: 'tool_use' } }],
        },
      },
    }

    const parts = processA2AEvent(event, createSession())
    expect(parts).toHaveLength(0)
  })

  it('returns finish(stop) for step.complete with stopReason=end_turn', () => {
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        kind: 'artifact-update',
        taskId: 't1',
        contextId: 'c1',
        artifact: {
          name: 'step.complete',
          artifactId: 'art-1',
          parts: [{ kind: 'data', data: { stopReason: 'end_turn' } }],
        },
      },
    }

    const parts = processA2AEvent(event, createSession())

    expect(parts).toHaveLength(1)
    expect(parts[0]).toEqual(
      expect.objectContaining({ type: 'finish', finishReason: 'stop' })
    )
  })

  it('returns text parts for step.message artifact', () => {
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        kind: 'artifact-update',
        taskId: 't1',
        contextId: 'c1',
        artifact: {
          name: 'step.message',
          artifactId: 'msg-1',
          parts: [{ kind: 'text', text: 'Hello world' }],
        },
      },
    }

    const parts = processA2AEvent(event, createSession())

    expect(parts).toEqual([
      { type: 'text-start', id: 'msg-1' },
      { type: 'text-delta', id: 'msg-1', delta: 'Hello world' },
      { type: 'text-end', id: 'msg-1' },
    ])
  })

  it('returns empty and updates session for REMOTE_TOOL_REQUEST', () => {
    const session = createSession()
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        type: 'REMOTE_TOOL_REQUEST',
        data: {
          requestId: 'req-1',
          chatId: 'chat-1',
          toolName: 'runValidation',
          toolInput: {},
        },
      },
    }

    const parts = processA2AEvent(event, session)

    expect(parts).toHaveLength(0)
    expect(session.unmatchedRemoteRequests).toHaveLength(1)
  })

  it('returns empty for event with no result and no error', () => {
    const event: A2ASSEEvent = { jsonrpc: '2.0', id: 1 }
    const parts = processA2AEvent(event, createSession())
    expect(parts).toHaveLength(0)
  })
})
