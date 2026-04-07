/* eslint-disable @typescript-eslint/unbound-method */
import { UIMessage } from 'ai'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AiHandler, StreamChatChunk, StreamChatEnd } from './types'

vi.mock('electron', () => ({
  ipcMain: {
    on: vi.fn(),
  },
}))

vi.mock('./model', () => ({
  getOpenAiModel: vi.fn(),
  getGrafanaAssistantModel: vi.fn(),
}))

vi.mock('./a2a/assistantAuth', () => ({
  initialize: vi.fn(),
}))

function createMockWebContents() {
  return { send: vi.fn() } as unknown as Electron.WebContents
}

function createUserMessage(text: string): UIMessage {
  return {
    id: 'msg-1',
    role: 'user',
    parts: [{ type: 'text', text }],
  }
}

async function getStreamChatHandler() {
  const { ipcMain } = await import('electron')
  const { initialize } = await import('./index')
  initialize()

  const calls = vi.mocked(ipcMain.on).mock.calls
  const entry = calls.find(
    ([channel]) => channel === (AiHandler.StreamChat as string)
  )
  return entry![1] as (...args: unknown[]) => Promise<void>
}

function getSentChunks(webContents: Electron.WebContents) {
  return vi
    .mocked(webContents.send)
    .mock.calls.filter(
      (call): call is [string, StreamChatChunk] =>
        call[0] === (AiHandler.StreamChatChunk as string)
    )
    .map(([, data]) => data)
}

function getSentEnds(webContents: Electron.WebContents) {
  return vi
    .mocked(webContents.send)
    .mock.calls.filter(
      (call): call is [string, StreamChatEnd] =>
        call[0] === (AiHandler.StreamChatEnd as string)
    )
    .map(([, data]) => data)
}

describe('handleStreamChat error handling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('forwards the error chunk and sends StreamChatEnd when the model throws', async () => {
    const { getOpenAiModel } = await import('./model')
    vi.mocked(getOpenAiModel).mockResolvedValue({
      specificationVersion: 'v2',
      provider: 'test',
      modelId: 'test',
      supportedUrls: {},
      // eslint-disable-next-line @typescript-eslint/require-await
      doStream: async () => {
        throw new Error('insufficient_quota: You exceeded your current quota')
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      doGenerate: async () => {
        throw new Error('not implemented')
      },
    })

    const handler = await getStreamChatHandler()
    const webContents = createMockWebContents()

    await handler(
      { sender: webContents },
      {
        id: 'req-1',
        trigger: 'submit-message',
        messages: [createUserMessage('Hello')],
      }
    )

    // The AI SDK's toUIMessageStream emits an error chunk with the real error
    const chunks = getSentChunks(webContents)
    const errorChunk = chunks.find((data) => data.chunk?.type === 'error')
    expect(errorChunk).toBeDefined()
    expect(errorChunk?.chunk).toHaveProperty('errorText')

    // StreamChatEnd must always be sent so the renderer doesn't hang
    const ends = getSentEnds(webContents)
    expect(ends).toHaveLength(1)
    expect(ends[0]?.id).toBe('req-1')
  })

  it('sends an error chunk and StreamChatEnd when message conversion fails', async () => {
    const handler = await getStreamChatHandler()
    const webContents = createMockWebContents()

    await handler(
      { sender: webContents },
      {
        id: 'req-2',
        trigger: 'submit-message',
        // Messages with null parts cause convertToModelMessages to throw
        messages: [
          { role: 'user', id: 'x', parts: null } as unknown as UIMessage,
        ],
      }
    )

    // Should send an error chunk from the catch block
    const chunks = getSentChunks(webContents)
    const errorChunk = chunks.find((data) => data.chunk?.type === 'error')
    expect(errorChunk).toBeDefined()

    // StreamChatEnd must always be sent
    const ends = getSentEnds(webContents)
    expect(ends).toHaveLength(1)
    expect(ends[0]?.id).toBe('req-2')
  })
})
