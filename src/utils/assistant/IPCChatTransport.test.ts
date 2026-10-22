import { EventEmitter } from 'node:events'
import { beforeEach, expect, it, vi } from 'vitest'

import { streamChat } from '@/handlers/ai/preload'
import { AiHandler, StreamChatRequest } from '@/handlers/ai/types'

import { IPCChatTransport } from './IPCChatTransport'

const ipc = vi.hoisted(() => ({ send: vi.fn() }))
const events = new EventEmitter()

vi.mock('electron', () => ({
  ipcRenderer: {
    send: (...args: unknown[]) => {
      ipc.send(...args)
    },
    on: (channel: string, callback: (...args: unknown[]) => void) =>
      events.on(channel, callback),
    removeListener: (channel: string, callback: (...args: unknown[]) => void) =>
      events.removeListener(channel, callback),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  events.removeAllListeners()
  vi.stubGlobal('studio', { ai: { streamChat } })
})

it('isolates reruns from the previous stream while preserving chat continuity', async () => {
  const requests: StreamChatRequest[] = []
  ipc.send.mockImplementation(
    (channel: AiHandler, request: StreamChatRequest) => {
      if (channel === AiHandler.StreamChat) requests.push(request)
    }
  )
  const transport = new IPCChatTransport({ tools: [] })
  const options = {
    trigger: 'submit-message' as const,
    chatId: 'same-chat',
    messageId: undefined,
    messages: [],
    abortSignal: undefined,
  }
  const previous = (await transport.sendMessages(options)).getReader()
  const current = (await transport.sendMessages(options)).getReader()
  const oldRequest = requests[0]!
  const newRequest = requests[1]!

  events.emit(
    AiHandler.StreamChatChunk,
    {},
    {
      id: oldRequest.id,
      chunk: { type: 'error', errorText: 'Old run aborted' },
    }
  )
  events.emit(AiHandler.StreamChatEnd, {}, { id: oldRequest.id })
  events.emit(
    AiHandler.StreamChatChunk,
    {},
    {
      id: newRequest.id,
      chunk: { type: 'start', messageId: 'new-message' },
    }
  )
  events.emit(AiHandler.StreamChatEnd, {}, { id: newRequest.id })

  expect((await current.read()).value).toEqual({
    type: 'start',
    messageId: 'new-message',
  })
  expect((await current.read()).done).toBe(true)
  expect((await previous.read()).value).toEqual({
    type: 'error',
    errorText: 'Old run aborted',
  })
  expect(newRequest.id).not.toBe(oldRequest.id)
  expect(requests).toEqual([
    expect.objectContaining({ chatId: 'same-chat' }),
    expect.objectContaining({ chatId: 'same-chat' }),
  ])
})
