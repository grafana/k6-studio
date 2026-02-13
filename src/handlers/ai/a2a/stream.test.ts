import type { LanguageModelV2StreamPart } from '@ai-sdk/provider'
import { describe, expect, it, vi } from 'vitest'

import { createA2AStream } from './stream'
import type { ActiveA2ASession } from './types'

vi.mock('electron-log/main', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

/** Encode SSE events as the A2A server would send them. */
function encodeSSE(
  events: Array<Record<string, unknown>>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }
      controller.close()
    },
  })
}

/** Encode SSE events where each event is a separate chunk. */
function encodeSSEChunked(
  events: Array<Record<string, unknown>>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const chunks = events.map((e) =>
    encoder.encode(`data: ${JSON.stringify(e)}\n\n`)
  )
  let index = 0
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        const chunk = chunks[index]
        if (chunk) controller.enqueue(chunk)
        index++
      } else {
        controller.close()
      }
    },
  })
}

function createSession(
  sseStream: ReadableStream<Uint8Array>,
  overrides?: Partial<ActiveA2ASession>
): ActiveA2ASession {
  return {
    reader: sseStream.getReader(),
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

async function collectStreamParts(
  stream: ReadableStream<LanguageModelV2StreamPart>
): Promise<LanguageModelV2StreamPart[]> {
  const parts: LanguageModelV2StreamPart[] = []
  const reader = stream.getReader()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    parts.push(value)
  }

  return parts
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
    const session = createSession(sseStream)
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
    const session = createSession(sseStream)
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
    const session = createSession(sseStream)
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
    ])

    const session = createSession(sseStream)
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

    const session = createSession(sseStream)
    const stream = createA2AStream(session, vi.fn())
    const parts = await collectStreamParts(stream)

    expect(parts.some((p) => p.type === 'text-delta')).toBe(true)
  })
})
