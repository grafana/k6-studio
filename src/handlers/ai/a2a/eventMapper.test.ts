import { describe, expect, it } from 'vitest'

import { createA2ASession } from '@/test/factories/a2aSession'

import { AssistantError } from './classifyError'
import { processA2AEvent } from './eventMapper'
import type {
  A2AArtifactPart,
  A2ASSEEvent,
  A2AStatusUpdateEvent,
  A2ATaskState,
} from './types'

function makeStatusUpdateEvent(
  state: A2ATaskState,
  statusOverrides?: Partial<A2AStatusUpdateEvent['status']>
): A2ASSEEvent {
  return {
    jsonrpc: '2.0',
    id: 1,
    result: {
      kind: 'status-update',
      taskId: 't1',
      contextId: 'c1',
      status: { state, ...statusOverrides },
    },
  }
}

function makeArtifactUpdateEvent(
  name: string,
  parts: A2AArtifactPart[],
  overrides?: { artifactId?: string }
): A2ASSEEvent {
  return {
    jsonrpc: '2.0',
    id: 1,
    result: {
      kind: 'artifact-update',
      taskId: 't1',
      contextId: 'c1',
      artifact: {
        kind: 'artifact',
        name,
        artifactId: overrides?.artifactId ?? 'art-1',
        parts,
      },
    },
  }
}

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
    const parts = processA2AEvent(
      makeStatusUpdateEvent('working'),
      createA2ASession()
    )
    expect(parts).toHaveLength(0)
  })

  it('returns finish(stop) for status-update(completed)', () => {
    const parts = processA2AEvent(
      makeStatusUpdateEvent('completed'),
      createA2ASession()
    )

    expect(parts).toHaveLength(1)
    expect(parts[0]).toEqual(
      expect.objectContaining({ type: 'finish', finishReason: 'stop' })
    )
  })

  it('returns error for status-update(failed)', () => {
    const parts = processA2AEvent(
      makeStatusUpdateEvent('failed'),
      createA2ASession()
    )

    expect(parts).toHaveLength(1)
    expect(parts[0]?.type).toBe('error')
  })

  it('returns error for status-update(rejected)', () => {
    const parts = processA2AEvent(
      makeStatusUpdateEvent('rejected'),
      createA2ASession()
    )

    expect(parts).toHaveLength(1)
    expect(parts[0]?.type).toBe('error')
  })

  it('returns error for status-update(auth-required)', () => {
    const parts = processA2AEvent(
      makeStatusUpdateEvent('auth-required'),
      createA2ASession()
    )

    expect(parts).toHaveLength(1)
    expect(parts[0]?.type).toBe('error')
  })

  it('includes status message text in failed error', () => {
    const event = makeStatusUpdateEvent('failed', {
      message: { parts: [{ text: 'Rate limit exceeded' }] },
    })

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
    const event = makeArtifactUpdateEvent('step.toolCall', [
      {
        kind: 'data',
        data: {
          toolId: 'tool-1',
          toolName: 'searchRequests',
          inputs: { query: 'login' },
        },
      },
    ])

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
    const event = makeArtifactUpdateEvent('step.complete', [
      { kind: 'data', data: { stopReason: 'tool_use' } },
    ])

    const parts = processA2AEvent(event, createA2ASession())
    expect(parts).toHaveLength(0)
  })

  it('returns finish(stop) for step.complete with stopReason=end_turn', () => {
    const event = makeArtifactUpdateEvent('step.complete', [
      { kind: 'data', data: { stopReason: 'end_turn' } },
    ])

    const parts = processA2AEvent(event, createA2ASession())

    expect(parts).toHaveLength(1)
    expect(parts[0]).toEqual(
      expect.objectContaining({ type: 'finish', finishReason: 'stop' })
    )
  })

  it('returns text parts for step.message artifact', () => {
    const event = makeArtifactUpdateEvent(
      'step.message',
      [{ kind: 'text', text: 'Hello world' }],
      { artifactId: 'msg-1' }
    )

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
            kind: 'artifact',
            name: 'message.content.delta',
            artifactId,
            parts: [{ kind: 'data', data: { delta, contentType } }],
          },
        },
      }
    }

    it('tracks activeStreamArtifactId on message.stream.start', () => {
      const session = createA2ASession()
      const event = makeArtifactUpdateEvent('message.stream.start', [], {
        artifactId: 'stream-1',
      })

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

      const event = makeArtifactUpdateEvent('message.stream.complete', [], {
        artifactId: 'complete-1',
      })

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

      const event = makeArtifactUpdateEvent(
        'step.message',
        [{ kind: 'text', text: 'Full message text' }],
        { artifactId: 'msg-1' }
      )

      const parts = processA2AEvent(event, session)

      expect(parts).toEqual([{ type: 'text-end', id: 'stream-1' }])
      expect(session.activeStreamArtifactId).toBeUndefined()
    })

    it('ignores message.content.delta with non-string delta', () => {
      const session = createA2ASession({ activeStreamArtifactId: 'stream-1' })

      const event = makeArtifactUpdateEvent(
        'message.content.delta',
        [{ kind: 'data', data: { someOther: 'field' } }],
        { artifactId: 'delta-1' }
      )

      const parts = processA2AEvent(event, session)
      expect(parts).toHaveLength(0)
    })
  })

  describe('AssistantError classification', () => {
    it('returns AssistantError for JSON-RPC errors', () => {
      const event: A2ASSEEvent = {
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32600, message: 'Invalid request' },
      }

      const parts = processA2AEvent(event, createA2ASession())
      const error = (parts[0] as { type: 'error'; error: Error }).error

      expect(error).toBeInstanceOf(AssistantError)
      expect((error as AssistantError).errorInfo.category).toBe('unknown')
    })

    it('classifies auth-related JSON-RPC error as auth-expired', () => {
      const event: A2ASSEEvent = {
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32600, message: 'Unauthorized' },
      }

      const parts = processA2AEvent(event, createA2ASession())
      const error = (parts[0] as { type: 'error'; error: AssistantError }).error

      expect(error.errorInfo.category).toBe('auth-expired')
    })

    it('returns AssistantError for failed task status', () => {
      const parts = processA2AEvent(
        makeStatusUpdateEvent('failed', {
          message: {
            parts: [{ text: 'Something went wrong' }],
          },
        }),
        createA2ASession()
      )
      const error = (parts[0] as { type: 'error'; error: Error }).error

      expect(error).toBeInstanceOf(AssistantError)
    })

    it('classifies failed task with quota message as quota-exceeded', () => {
      const parts = processA2AEvent(
        makeStatusUpdateEvent('failed', {
          message: {
            parts: [
              {
                text: 'RESOURCE_LIMIT_EXCEEDED: Monthly prompt limit reached',
              },
            ],
          },
        }),
        createA2ASession()
      )
      const error = (parts[0] as { type: 'error'; error: AssistantError }).error

      expect(error.errorInfo.category).toBe('quota-exceeded')
    })

    it('classifies canceled task as unknown', () => {
      const parts = processA2AEvent(
        makeStatusUpdateEvent('canceled'),
        createA2ASession()
      )
      const error = (parts[0] as { type: 'error'; error: AssistantError }).error

      expect(error.errorInfo.category).toBe('unknown')
    })
  })
})
