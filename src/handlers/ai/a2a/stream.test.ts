import { describe, expect, it, vi } from 'vitest'

import { createA2ASession } from '@/test/factories/a2aSession'
import {
  collectStreamParts,
  encodeSSE,
  encodeSSEChunked,
} from '@/test/utils/sse'

import type { ActiveA2ASession } from './session'
import { createA2AStream } from './stream'

function createSessionWithStream(
  sseStream: ReadableStream<Uint8Array>,
  overrides?: Partial<ActiveA2ASession>
): ActiveA2ASession {
  return createA2ASession({
    reader: sseStream.getReader(),
    ...overrides,
  })
}

describe('createA2AStream', () => {
  it('emits finish(stop) for a completed task', async () => {
    const sseStream = encodeSSE([
      {
        jsonrpc: '2.0',
        id: 1,
        result: {
          kind: 'status-update',
          taskId: 't1',
          contextId: 'c1',
          status: { state: 'working' },
        },
      },
      {
        jsonrpc: '2.0',
        id: 2,
        result: {
          kind: 'status-update',
          taskId: 't1',
          contextId: 'c1',
          status: { state: 'completed' },
        },
      },
    ])

    const cleanup = vi.fn()
    const session = createSessionWithStream(sseStream)
    const stream = createA2AStream(session, cleanup)
    const parts = await collectStreamParts(stream)

    const finishPart = parts.find((p) => p.type === 'finish')
    expect(finishPart).toEqual(
      expect.objectContaining({ type: 'finish', finishReason: 'stop' })
    )
    expect(cleanup).toHaveBeenCalled()
  })

  it('emits error for a failed task', async () => {
    const sseStream = encodeSSE([
      {
        jsonrpc: '2.0',
        id: 1,
        result: {
          kind: 'status-update',
          taskId: 't1',
          contextId: 'c1',
          status: { state: 'failed' },
        },
      },
    ])

    const cleanup = vi.fn()
    const session = createSessionWithStream(sseStream)
    const stream = createA2AStream(session, cleanup)
    const parts = await collectStreamParts(stream)

    expect(parts.some((p) => p.type === 'error')).toBe(true)
    expect(cleanup).toHaveBeenCalled()
  })

  it('emits tool-call then finish(tool-calls) for remote tool flow', async () => {
    const sseStream = encodeSSEChunked([
      {
        jsonrpc: '2.0',
        id: 1,
        result: {
          kind: 'status-update',
          taskId: 't1',
          contextId: 'c1',
          status: { state: 'working' },
        },
      },
      {
        jsonrpc: '2.0',
        id: 2,
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
      },
      {
        jsonrpc: '2.0',
        id: 3,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'step.complete',
            artifactId: 'complete-1',
            parts: [{ kind: 'data', data: { stopReason: 'tool_use' } }],
          },
        },
      },
      {
        jsonrpc: '2.0',
        id: 4,
        result: {
          type: 'REMOTE_TOOL_REQUEST',
          data: {
            requestId: 'req-1',
            chatId: 'chat-1',
            toolName: 'searchRequests',
            toolInput: { query: 'login' },
          },
        },
      },
    ])

    const cleanup = vi.fn()
    const session = createSessionWithStream(sseStream)
    const stream = createA2AStream(session, cleanup)
    const parts = await collectStreamParts(stream)

    const toolCall = parts.find((p) => p.type === 'tool-call')
    expect(toolCall).toEqual(
      expect.objectContaining({
        type: 'tool-call',
        toolCallId: 'tool-1',
        toolName: 'searchRequests',
      })
    )

    const finish = parts.find((p) => p.type === 'finish')
    expect(finish).toEqual(
      expect.objectContaining({
        type: 'finish',
        finishReason: 'tool-calls',
      })
    )

    // Session should NOT be cleaned up for tool-calls (needed for continuation)
    expect(cleanup).not.toHaveBeenCalled()
  })

  it('closes a block opened by a trailing delta before finish(tool-calls)', async () => {
    // A thinking delta can slip in after step.complete cleared the stream
    // trackers; the re-opened block must be closed before the stream finishes,
    // or the stale tracker makes the next round emit a delta with no start.
    const sseStream = encodeSSEChunked([
      {
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
      },
      {
        jsonrpc: '2.0',
        id: 2,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'step.complete',
            artifactId: 'complete-1',
            parts: [{ kind: 'data', data: { stopReason: 'tool_use' } }],
          },
        },
      },
      {
        jsonrpc: '2.0',
        id: 3,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'message.content.delta',
            artifactId: 'trailing-1',
            parts: [
              {
                kind: 'data',
                data: { delta: 'trailing thought', contentType: 'thinking' },
              },
            ],
          },
        },
      },
      {
        jsonrpc: '2.0',
        id: 4,
        result: {
          type: 'REMOTE_TOOL_REQUEST',
          data: {
            requestId: 'req-1',
            chatId: 'chat-1',
            toolName: 'searchRequests',
            toolInput: { query: 'login' },
          },
        },
      },
    ])

    const session = createSessionWithStream(sseStream)
    const stream = createA2AStream(session, vi.fn())
    const parts = await collectStreamParts(stream)

    const starts = parts.filter((p) => p.type === 'reasoning-start')
    const ends = parts.filter((p) => p.type === 'reasoning-end')
    expect(starts).toHaveLength(1)
    expect(ends).toHaveLength(1)

    const finishIndex = parts.findIndex((p) => p.type === 'finish')
    expect(parts.indexOf(ends[0]!)).toBeLessThan(finishIndex)
    // The trackers must not leak into the next round's stream.
    expect(session.activeStreamArtifactId).toBeUndefined()
    expect(session.activeStreamContentType).toBeUndefined()
  })

  it('closes an open block when the stream ends without a terminal event', async () => {
    // The server dropping the SSE connection mid-generation must not leave
    // the opened reasoning block unbalanced in front of finish(stop).
    const sseStream = encodeSSE([
      {
        jsonrpc: '2.0',
        id: 1,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'message.content.delta',
            artifactId: 'msg-1',
            parts: [
              {
                kind: 'data',
                data: { delta: 'partial thought', contentType: 'thinking' },
              },
            ],
          },
        },
      },
    ])

    const cleanup = vi.fn()
    const session = createSessionWithStream(sseStream)
    const stream = createA2AStream(session, cleanup)
    const parts = await collectStreamParts(stream)

    const endIndex = parts.findIndex((p) => p.type === 'reasoning-end')
    const finishIndex = parts.findIndex((p) => p.type === 'finish')
    expect(endIndex).toBeGreaterThan(-1)
    expect(endIndex).toBeLessThan(finishIndex)
    expect(parts[finishIndex]).toEqual(
      expect.objectContaining({ type: 'finish', finishReason: 'stop' })
    )
    expect(cleanup).toHaveBeenCalled()
  })

  it('emits all tool calls when multiple same-name tools are interleaved', async () => {
    const sseStream = encodeSSEChunked([
      {
        jsonrpc: '2.0',
        id: 1,
        result: {
          kind: 'status-update',
          taskId: 't1',
          contextId: 'c1',
          status: { state: 'working' },
        },
      },
      // Both tool calls emitted first
      {
        jsonrpc: '2.0',
        id: 2,
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
                  toolName: 'addCorrelationRule',
                  inputs: { rule: 'rule1' },
                },
              },
            ],
          },
        },
      },
      // Second tool call
      {
        jsonrpc: '2.0',
        id: 4,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'step.toolCall',
            artifactId: 'art-2',
            parts: [
              {
                kind: 'data',
                data: {
                  toolId: 'tool-2',
                  toolName: 'addCorrelationRule',
                  inputs: { rule: 'rule2' },
                },
              },
            ],
          },
        },
      },
      // step.complete signals all tool calls have been emitted
      {
        jsonrpc: '2.0',
        id: 5,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'step.complete',
            artifactId: 'complete-1',
            parts: [{ kind: 'data', data: { stopReason: 'tool_use' } }],
          },
        },
      },
      // REMOTE_TOOL_REQUESTs arrive after step.complete
      {
        jsonrpc: '2.0',
        id: 6,
        result: {
          type: 'REMOTE_TOOL_REQUEST',
          data: {
            requestId: 'req-1',
            chatId: 'chat-1',
            toolName: 'addCorrelationRule',
            toolInput: { rule: 'rule1' },
          },
        },
      },
      {
        jsonrpc: '2.0',
        id: 7,
        result: {
          type: 'REMOTE_TOOL_REQUEST',
          data: {
            requestId: 'req-2',
            chatId: 'chat-1',
            toolName: 'addCorrelationRule',
            toolInput: { rule: 'rule2' },
          },
        },
      },
    ])

    const cleanup = vi.fn()
    const session = createSessionWithStream(sseStream)
    const stream = createA2AStream(session, cleanup)
    const parts = await collectStreamParts(stream)

    const toolCalls = parts.filter((p) => p.type === 'tool-call')
    expect(toolCalls).toHaveLength(2)
    expect(toolCalls[0]).toEqual(
      expect.objectContaining({ toolCallId: 'tool-1' })
    )
    expect(toolCalls[1]).toEqual(
      expect.objectContaining({ toolCallId: 'tool-2' })
    )

    // Both should be matched in pendingToolRequests
    expect(session.pendingToolRequests.size).toBe(2)
    expect(session.pendingToolRequests.has('tool-1')).toBe(true)
    expect(session.pendingToolRequests.has('tool-2')).toBe(true)

    expect(
      parts.some((p) => p.type === 'finish' && p.finishReason === 'tool-calls')
    ).toBe(true)
    expect(cleanup).not.toHaveBeenCalled()
  })

  it('handles REMOTE_TOOL_REQUEST arriving before step.toolCall', async () => {
    const sseStream = encodeSSEChunked([
      {
        jsonrpc: '2.0',
        id: 1,
        result: {
          kind: 'status-update',
          taskId: 't1',
          contextId: 'c1',
          status: { state: 'working' },
        },
      },
      // REMOTE_TOOL_REQUEST arrives FIRST
      {
        jsonrpc: '2.0',
        id: 2,
        result: {
          type: 'REMOTE_TOOL_REQUEST',
          data: {
            requestId: 'req-1',
            chatId: 'chat-1',
            toolName: 'getRequestsMetadata',
            toolInput: {},
          },
        },
      },
      // step.toolCall arrives SECOND
      {
        jsonrpc: '2.0',
        id: 3,
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
                  toolName: 'getRequestsMetadata',
                  inputs: {},
                },
              },
            ],
          },
        },
      },
      {
        jsonrpc: '2.0',
        id: 4,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'step.complete',
            artifactId: 'complete-1',
            parts: [{ kind: 'data', data: { stopReason: 'tool_use' } }],
          },
        },
      },
    ])

    const session = createSessionWithStream(sseStream)
    const stream = createA2AStream(session, vi.fn())
    const parts = await collectStreamParts(stream)

    expect(parts.some((p) => p.type === 'tool-call')).toBe(true)
    expect(
      parts.some((p) => p.type === 'finish' && p.finishReason === 'tool-calls')
    ).toBe(true)
  })

  it('emits text parts for step.message artifacts', async () => {
    const sseStream = encodeSSE([
      {
        jsonrpc: '2.0',
        id: 1,
        result: {
          kind: 'status-update',
          taskId: 't1',
          contextId: 'c1',
          status: { state: 'working' },
        },
      },
      {
        jsonrpc: '2.0',
        id: 2,
        result: {
          kind: 'artifact-update',
          taskId: 't1',
          contextId: 'c1',
          artifact: {
            name: 'step.message',
            artifactId: 'msg-1',
            parts: [{ kind: 'text', text: 'Hello' }],
          },
        },
      },
      {
        jsonrpc: '2.0',
        id: 3,
        result: {
          kind: 'status-update',
          taskId: 't1',
          contextId: 'c1',
          status: { state: 'completed' },
        },
      },
    ])

    const session = createSessionWithStream(sseStream)
    const stream = createA2AStream(session, vi.fn())
    const parts = await collectStreamParts(stream)

    expect(parts.some((p) => p.type === 'text-delta')).toBe(true)
  })
})
