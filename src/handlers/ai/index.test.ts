/* eslint-disable @typescript-eslint/unbound-method */
import type { IpcMainEvent } from 'electron'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AiHandler, StreamChatRequest } from './types'

import { handleStreamChat } from './index'

vi.mock('electron', () => ({
  ipcMain: { on: vi.fn(), handle: vi.fn() },
}))

vi.mock('ai', () => ({
  convertToModelMessages: vi.fn(() => []),
  streamText: vi.fn(),
}))

vi.mock('./model', () => ({
  getOpenAiModel: vi.fn(),
  getGrafanaAssistantModel: vi.fn(),
}))

vi.mock('./streamMessages', () => ({
  streamMessages: vi.fn(),
}))

vi.mock('./a2a/assistantAuth', () => ({
  initialize: vi.fn(),
}))

vi.mock('./tools', () => ({
  tools: {},
}))

function createMockEvent() {
  return {
    sender: { send: vi.fn() },
  } as unknown as IpcMainEvent
}

function createRequest(
  overrides?: Partial<StreamChatRequest>
): StreamChatRequest {
  return {
    id: 'test-request-id',
    trigger: 'submit-message',
    messages: [],
    ...overrides,
  }
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('handleStreamChat', () => {
  it('sends error chunk when getOpenAiModel throws', async () => {
    const { getOpenAiModel } = await import('./model')
    vi.mocked(getOpenAiModel).mockRejectedValue(new Error('API key missing'))

    const event = createMockEvent()
    const request = createRequest()

    await handleStreamChat(event, request)

    expect(event.sender.send).toHaveBeenCalledWith(AiHandler.StreamChatChunk, {
      id: 'test-request-id',
      chunk: {
        type: 'error',
        errorText: 'API key missing',
      },
    })
  })

  it('sends error chunk when streamMessages throws mid-stream', async () => {
    const { getOpenAiModel } = await import('./model')
    vi.mocked(getOpenAiModel).mockResolvedValue({} as never)

    const { streamText } = await import('ai')
    vi.mocked(streamText).mockReturnValue({} as never)

    const { streamMessages } = await import('./streamMessages')
    vi.mocked(streamMessages).mockRejectedValue(new Error('Connection reset'))

    const event = createMockEvent()
    const request = createRequest()

    await handleStreamChat(event, request)

    expect(event.sender.send).toHaveBeenCalledWith(AiHandler.StreamChatChunk, {
      id: 'test-request-id',
      chunk: {
        type: 'error',
        errorText: 'Connection reset',
      },
    })
  })

  it('sends Unknown error when catch receives a non-Error value', async () => {
    const { getOpenAiModel } = await import('./model')
    vi.mocked(getOpenAiModel).mockRejectedValue('string error')

    const event = createMockEvent()
    const request = createRequest()

    await handleStreamChat(event, request)

    expect(event.sender.send).toHaveBeenCalledWith(AiHandler.StreamChatChunk, {
      id: 'test-request-id',
      chunk: {
        type: 'error',
        errorText: 'Unknown error',
      },
    })
  })
})
