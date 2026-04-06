import { describe, expect, it, vi } from 'vitest'

import { AiHandler } from './types'

async function* createMockChunks(chunks: unknown[]) {
  for (const chunk of chunks) {
    yield chunk
  }
}

async function* createFailingChunks(
  chunks: unknown[],
  error: Error
) {
  for (const chunk of chunks) {
    yield chunk
  }
  throw error
}

function createMockWebContents() {
  return {
    send: vi.fn(),
    isDestroyed: vi.fn(() => false),
  } as unknown as Electron.WebContents
}

function createMockResponse(
  stream: AsyncIterable<unknown>,
  usage?: unknown
): Parameters<typeof import('./streamMessages').streamMessages>[1] {
  return {
    toUIMessageStream: () => stream,
    usage: Promise.resolve(usage),
  } as Parameters<typeof import('./streamMessages').streamMessages>[1]
}

describe('streamMessages', () => {
  it('sends chunks and end event on successful stream', async () => {
    const { streamMessages } = await import('./streamMessages')
    const webContents = createMockWebContents()
    const chunks = [{ type: 'text', text: 'hello' }, { type: 'text', text: ' world' }]
    const response = createMockResponse(createMockChunks(chunks))

    await streamMessages(webContents, response, 'req-1', false)

    expect(webContents.send).toHaveBeenCalledTimes(3)
    expect(webContents.send).toHaveBeenNthCalledWith(1, AiHandler.StreamChatChunk, {
      id: 'req-1',
      chunk: chunks[0],
    })
    expect(webContents.send).toHaveBeenNthCalledWith(2, AiHandler.StreamChatChunk, {
      id: 'req-1',
      chunk: chunks[1],
    })
    expect(webContents.send).toHaveBeenNthCalledWith(3, AiHandler.StreamChatEnd, {
      id: 'req-1',
      usage: undefined,
    })
  })

  it('sends usage data when includeUsage is true', async () => {
    const { streamMessages } = await import('./streamMessages')
    const webContents = createMockWebContents()
    const usage = { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    const response = createMockResponse(createMockChunks([]), usage)

    await streamMessages(webContents, response, 'req-2', true)

    expect(webContents.send).toHaveBeenCalledWith(AiHandler.StreamChatEnd, {
      id: 'req-2',
      usage,
    })
  })

  it('propagates errors from the stream without sending end event', async () => {
    const { streamMessages } = await import('./streamMessages')
    const webContents = createMockWebContents()
    const error = new Error('API connection lost')
    const response = createMockResponse(
      createFailingChunks([{ type: 'text', text: 'partial' }], error)
    )

    await expect(
      streamMessages(webContents, response, 'req-3', false)
    ).rejects.toThrow('API connection lost')

    // StreamChatEnd should NOT have been sent by streamMessages itself —
    // the caller (handleStreamChat) is responsible for sending it on error
    const endCalls = (webContents.send as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([event]: [string]) => event === AiHandler.StreamChatEnd
    )
    expect(endCalls).toHaveLength(0)
  })
})
