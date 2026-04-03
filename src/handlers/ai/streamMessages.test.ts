import type { LanguageModelV2StreamPart } from '@ai-sdk/provider'
import { describe, expect, it, vi } from 'vitest'

import { streamFromDoStream } from './streamMessages'
import { AiHandler } from './types'

function createMockWebContents() {
  return { send: vi.fn() } as unknown as Electron.WebContents
}

function createStream(
  parts: LanguageModelV2StreamPart[]
): ReadableStream<LanguageModelV2StreamPart> {
  return new ReadableStream({
    start(controller) {
      for (const part of parts) {
        controller.enqueue(part)
      }
      controller.close()
    },
  })
}

describe('streamFromDoStream', () => {
  it('streams text-start, text-delta, text-end as IPC chunks', async () => {
    const wc = createMockWebContents()
    const stream = createStream([
      { type: 'text-start', id: 't1' },
      { type: 'text-delta', id: 't1', delta: 'Hello' },
      { type: 'text-delta', id: 't1', delta: ' world' },
      { type: 'text-end', id: 't1' },
      {
        type: 'finish',
        finishReason: 'stop',
        usage: {
          inputTokens: undefined,
          outputTokens: undefined,
          totalTokens: undefined,
        },
      },
    ])

    await streamFromDoStream(wc, stream, 'req-1')

    const chunks = (wc.send as ReturnType<typeof vi.fn>).mock.calls
      .filter(([handler]) => handler === AiHandler.StreamChatChunk)
      .map(([, data]) => (data as { chunk: unknown }).chunk)

    expect(chunks).toEqual([
      { type: 'start' },
      { type: 'start-step' },
      { type: 'text-start', id: 't1' },
      { type: 'text-delta', id: 't1', delta: 'Hello' },
      { type: 'text-delta', id: 't1', delta: ' world' },
      { type: 'text-end', id: 't1' },
      { type: 'finish-step' },
      { type: 'finish', finishReason: 'stop' },
    ])
  })

  it('streams tool-call and tool-result parts', async () => {
    const wc = createMockWebContents()
    const stream = createStream([
      {
        type: 'tool-call',
        toolCallId: 'tc-1',
        toolName: 'searchRequests',
        input: '{"query":"login"}',
      },
      {
        type: 'tool-result',
        toolCallId: 'tc-1',
        toolName: 'searchRequests',
        result: [{ id: '1' }],
      },
      {
        type: 'finish',
        finishReason: 'tool-calls',
        usage: {
          inputTokens: undefined,
          outputTokens: undefined,
          totalTokens: undefined,
        },
      },
    ])

    await streamFromDoStream(wc, stream, 'req-1')

    const chunks = (wc.send as ReturnType<typeof vi.fn>).mock.calls
      .filter(([handler]) => handler === AiHandler.StreamChatChunk)
      .map(([, data]) => (data as { chunk: unknown }).chunk)

    expect(chunks).toEqual([
      { type: 'start' },
      { type: 'start-step' },
      {
        type: 'tool-call',
        toolCallId: 'tc-1',
        toolName: 'searchRequests',
        args: '{"query":"login"}',
      },
      {
        type: 'tool-result',
        toolCallId: 'tc-1',
        result: [{ id: '1' }],
      },
      { type: 'finish-step' },
      { type: 'finish', finishReason: 'tool-calls' },
    ])
  })

  it('sends error chunk for error parts', async () => {
    const wc = createMockWebContents()
    const stream = createStream([
      { type: 'error', error: new Error('A2A failed') },
    ])

    await streamFromDoStream(wc, stream, 'req-1')

    const chunks = (wc.send as ReturnType<typeof vi.fn>).mock.calls
      .filter(([handler]) => handler === AiHandler.StreamChatChunk)
      .map(([, data]) => (data as { chunk: unknown }).chunk)

    expect(chunks).toContainEqual({
      type: 'error',
      errorText: 'A2A failed',
    })
  })

  it('sends StreamChatEnd when stream completes', async () => {
    const wc = createMockWebContents()
    const stream = createStream([
      {
        type: 'finish',
        finishReason: 'stop',
        usage: {
          inputTokens: undefined,
          outputTokens: undefined,
          totalTokens: undefined,
        },
      },
    ])

    await streamFromDoStream(wc, stream, 'req-1')

    const endCalls = (wc.send as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([handler]) => handler === AiHandler.StreamChatEnd
    )

    expect(endCalls).toHaveLength(1)
    expect(endCalls[0]![1]).toEqual({ id: 'req-1' })
  })
})
