import type { LanguageModelV2CallOptions } from '@ai-sdk/provider'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { drainStream, encodeSSEChunked } from '@/test/utils/sse'

import { sendTaskCancel } from './a2a/cancelTask'
import { GrafanaAssistantLanguageModel } from './grafanaAssistantProvider'

vi.mock('./tools', () => ({
  getToolDefinitionsForA2A: () => [],
}))

vi.mock('./a2a/config', () => ({
  getA2AConfig: vi.fn(() =>
    Promise.resolve({
      baseUrl: 'http://test-a2a',
      agentId: 'test-agent',
      extensions: 'test-ext',
      bearerToken: 'test-token',
    })
  ),
}))

vi.mock('./a2a/cancelTask', () => ({
  sendTaskCancel: vi.fn(() => Promise.resolve()),
}))

function makeSSEResponse(sseStream: ReadableStream<Uint8Array>): Response {
  return new Response(sseStream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

function makeToolCallSSEEvents(
  taskId: string,
  contextId: string,
  chatId: string,
  toolName = 'searchRequests'
) {
  return [
    {
      jsonrpc: '2.0',
      id: 1,
      result: {
        kind: 'status-update',
        taskId,
        contextId,
        status: { state: 'working' },
      },
    },
    {
      jsonrpc: '2.0',
      id: 2,
      result: {
        kind: 'artifact-update',
        taskId,
        contextId,
        artifact: {
          name: 'step.toolCall',
          artifactId: 'art-1',
          parts: [
            {
              kind: 'data',
              data: {
                toolId: 'tool-1',
                toolName,
                inputs: {},
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
          chatId,
          toolName,
          toolInput: {},
        },
      },
    },
  ]
}

function makeCompletedSSEEvent(taskId: string, contextId: string) {
  return {
    jsonrpc: '2.0',
    id: 4,
    result: {
      kind: 'status-update',
      taskId,
      contextId,
      status: { state: 'completed' },
    },
  }
}

function makeOptions(
  chatId: string,
  userText: string
): LanguageModelV2CallOptions {
  return {
    prompt: [{ role: 'user', content: [{ type: 'text', text: userText }] }],
    providerOptions: { grafanaAssistant: { chatId } },
  } as unknown as LanguageModelV2CallOptions
}

describe('GrafanaAssistantLanguageModel', () => {
  const fetchSpy =
    vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('handleNewMessage contextId preservation', () => {
    it('passes contextId from previous session in the next request', async () => {
      const model = new GrafanaAssistantLanguageModel()

      // First call: SSE stream finishes with tool-calls, keeping session alive.
      fetchSpy.mockResolvedValueOnce(
        makeSSEResponse(
          encodeSSEChunked(
            makeToolCallSSEEvents('t1', 'ctx-from-server', 'chat-1')
          )
        )
      )

      const firstResult = await model.doStream(
        makeOptions('chat-1', 'First message')
      )
      await drainStream(firstResult.stream)

      // Second call: new user message (no tool results) → handleNewMessage.
      // The contextId from the surviving session should be included.
      fetchSpy.mockResolvedValueOnce(
        makeSSEResponse(
          encodeSSEChunked([makeCompletedSSEEvent('t2', 'ctx-from-server')])
        )
      )

      await model.doStream(makeOptions('chat-1', 'Second message'))

      const secondCallBody = JSON.parse(
        fetchSpy.mock.calls[1]![1]!.body as string
      ) as Record<string, unknown>
      const params = secondCallBody.params as Record<string, unknown>

      expect(params.contextId).toBe('ctx-from-server')
    })
  })

  describe('task cancellation on abort', () => {
    it('sends tasks/cancel when session with taskId is aborted', async () => {
      const sendTaskCancelMock = vi.mocked(sendTaskCancel)

      const model = new GrafanaAssistantLanguageModel()
      const abortController = new AbortController()

      fetchSpy.mockResolvedValueOnce(
        makeSSEResponse(
          encodeSSEChunked(
            makeToolCallSSEEvents('task-to-cancel', 'c1', 'abort-chat')
          )
        )
      )

      const result = await model.doStream({
        ...makeOptions('abort-chat', 'Hello'),
        abortSignal: abortController.signal,
      })

      // Drain the stream to consume the tool-calls finish
      await drainStream(result.stream)

      // Now abort — this should trigger cleanupSession with the abort flag
      abortController.abort()

      // Start a new message for the same chatId so handleNewMessage cleans up
      // the old session (which now has taskId='task-to-cancel').
      fetchSpy.mockResolvedValueOnce(
        makeSSEResponse(encodeSSEChunked([makeCompletedSSEEvent('t2', 'c1')]))
      )

      const result2 = await model.doStream(
        makeOptions('abort-chat', 'New message')
      )
      await drainStream(result2.stream)

      expect(sendTaskCancelMock).toHaveBeenCalledWith(
        expect.objectContaining({ bearerToken: 'test-token' }),
        'task-to-cancel'
      )
    })

    it('does NOT send tasks/cancel when session finishes normally', async () => {
      const sendTaskCancelMock = vi.mocked(sendTaskCancel)
      sendTaskCancelMock.mockClear()

      const model = new GrafanaAssistantLanguageModel()

      fetchSpy.mockResolvedValueOnce(
        makeSSEResponse(
          encodeSSEChunked([
            {
              jsonrpc: '2.0',
              id: 1,
              result: {
                kind: 'status-update',
                taskId: 'task-normal',
                contextId: 'c1',
                status: { state: 'working' },
              },
            },
            {
              jsonrpc: '2.0',
              id: 2,
              result: {
                kind: 'status-update',
                taskId: 'task-normal',
                contextId: 'c1',
                status: { state: 'completed' },
              },
            },
          ])
        )
      )

      const result = await model.doStream(makeOptions('normal-chat', 'Hello'))
      await drainStream(result.stream)

      expect(sendTaskCancelMock).not.toHaveBeenCalled()
    })
  })

  describe('handleNewMessage aborts existing session', () => {
    it('cancels old task when a new message replaces an active session', async () => {
      const sendTaskCancelMock = vi.mocked(sendTaskCancel)

      const model = new GrafanaAssistantLanguageModel()

      // First call finishes with tool-calls, keeping session alive with a taskId
      fetchSpy.mockResolvedValueOnce(
        makeSSEResponse(
          encodeSSEChunked(
            makeToolCallSSEEvents('old-task', 'c1', 'replace-chat')
          )
        )
      )

      const firstResult = await model.doStream(
        makeOptions('replace-chat', 'First message')
      )
      await drainStream(firstResult.stream)

      // Second call: new user message replaces the still-active session.
      // handleNewMessage should abort the old session and cancel its task.
      fetchSpy.mockResolvedValueOnce(
        makeSSEResponse(
          encodeSSEChunked([makeCompletedSSEEvent('new-task', 'c1')])
        )
      )

      const secondResult = await model.doStream(
        makeOptions('replace-chat', 'Second message')
      )
      await drainStream(secondResult.stream)

      expect(sendTaskCancelMock).toHaveBeenCalledWith(
        expect.objectContaining({ bearerToken: 'test-token' }),
        'old-task'
      )
    })
  })
})
