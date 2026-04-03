import { describe, expect, it } from 'vitest'

import { createA2ASession } from '@/test/factories/a2aSession'

import { processA2AEvent } from './eventMapper'
import type { A2ASSEEvent } from './types'

describe('processA2AEvent', () => {
  it('returns error part for JSON-RPC errors', () => {
    const event: A2ASSEEvent = {
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32600, message: 'Invalid request' },
    }

    const parts = processA2AEvent(event, createA2ASession())

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

    const parts = processA2AEvent(event, createA2ASession())
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

    const parts = processA2AEvent(event, createA2ASession())

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

    const parts = processA2AEvent(event, createA2ASession())

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

    const parts = processA2AEvent(event, createA2ASession())
    const error = (parts[0] as { type: 'error'; error: Error }).error

    expect(error.message).toBe('Rate limit exceeded')
  })

  it('updates session taskId and contextId on status-update', () => {
    const session = createA2ASession()
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

    const parts = processA2AEvent(event, createA2ASession())

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

    const parts = processA2AEvent(event, createA2ASession())
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

    const parts = processA2AEvent(event, createA2ASession())

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

    const parts = processA2AEvent(event, createA2ASession())

    expect(parts).toEqual([
      { type: 'text-start', id: 'msg-1' },
      { type: 'text-delta', id: 'msg-1', delta: 'Hello world' },
      { type: 'text-end', id: 'msg-1' },
    ])
  })

  it('returns empty and updates session for REMOTE_TOOL_REQUEST', () => {
    const session = createA2ASession()
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
    const parts = processA2AEvent(event, createA2ASession())
    expect(parts).toHaveLength(0)
  })

  describe('token streaming', () => {
    function makeDeltaEvent(
      artifactId: string,
      delta: string,
      contentType = 'text'
    ): A2ASSEEvent {
      return {
        jsonrpc: '2.0',
        id: 1,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'message.content.delta',
            artifactId,
            parts: [{ kind: 'data', data: { delta, contentType } }],
          },
        },
      }
    }

    it('tracks activeStreamArtifactId on message.stream.start', () => {
      const session = createA2ASession()
      const event: A2ASSEEvent = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'message.stream.start',
            artifactId: 'stream-1',
            parts: [],
          },
        },
      }

      const parts = processA2AEvent(event, session)

      expect(parts).toEqual([])
      expect(session.activeStreamArtifactId).toBe('stream-1')
    })

    it('emits text-start and text-delta for text content', () => {
      const session = createA2ASession({ activeStreamArtifactId: 'stream-1' })

      const parts = processA2AEvent(
        makeDeltaEvent('d1', 'Hello ', 'text'),
        session
      )

      expect(parts).toEqual([
        { type: 'text-start', id: 'stream-1' },
        { type: 'text-delta', id: 'stream-1', delta: 'Hello ' },
      ])
      expect(session.activeStreamContentType).toBe('text')
    })

    it('emits reasoning-start and reasoning-delta for thinking content', () => {
      const session = createA2ASession({ activeStreamArtifactId: 'stream-1' })

      const parts = processA2AEvent(
        makeDeltaEvent('d1', 'Let me think...', 'thinking'),
        session
      )

      expect(parts).toEqual([
        { type: 'reasoning-start', id: 'stream-1' },
        { type: 'reasoning-delta', id: 'stream-1', delta: 'Let me think...' },
      ])
      expect(session.activeStreamContentType).toBe('reasoning')
    })

    it('transitions from reasoning to text with end/start events', () => {
      const session = createA2ASession({
        activeStreamArtifactId: 'stream-1',
        activeStreamContentType: 'reasoning',
      })

      const parts = processA2AEvent(
        makeDeltaEvent('d1', 'Here is the answer', 'text'),
        session
      )

      expect(parts).toEqual([
        { type: 'reasoning-end', id: 'stream-1' },
        { type: 'text-start', id: 'stream-1' },
        { type: 'text-delta', id: 'stream-1', delta: 'Here is the answer' },
      ])
      expect(session.activeStreamContentType).toBe('text')
    })

    it('closes active block on message.stream.complete', () => {
      const session = createA2ASession({
        activeStreamArtifactId: 'stream-1',
        activeStreamContentType: 'text',
      })

      const event: A2ASSEEvent = {
        jsonrpc: '2.0',
        id: 3,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'message.stream.complete',
            artifactId: 'complete-1',
            parts: [],
          },
        },
      }

      const parts = processA2AEvent(event, session)

      expect(parts).toEqual([{ type: 'text-end', id: 'stream-1' }])
      expect(session.activeStreamArtifactId).toBeUndefined()
      expect(session.activeStreamContentType).toBeUndefined()
    })

    it('skips step.message when token streaming was active (dedup)', () => {
      const session = createA2ASession({
        activeStreamArtifactId: 'stream-1',
        activeStreamContentType: 'text',
      })

      const event: A2ASSEEvent = {
        jsonrpc: '2.0',
        id: 4,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'step.message',
            artifactId: 'msg-1',
            parts: [{ kind: 'text', text: 'Full message text' }],
          },
        },
      }

      const parts = processA2AEvent(event, session)

      expect(parts).toEqual([{ type: 'text-end', id: 'stream-1' }])
      expect(session.activeStreamArtifactId).toBeUndefined()
    })

    it('ignores message.content.delta with non-string delta', () => {
      const session = createA2ASession({ activeStreamArtifactId: 'stream-1' })

      const event: A2ASSEEvent = {
        jsonrpc: '2.0',
        id: 2,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'message.content.delta',
            artifactId: 'delta-1',
            parts: [{ kind: 'data', data: { someOther: 'field' } }],
          },
        },
      }

      const parts = processA2AEvent(event, session)
      expect(parts).toHaveLength(0)
    })
  })
})
