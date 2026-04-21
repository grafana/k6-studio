import type { LanguageModelV2CallOptions } from '@ai-sdk/provider'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  collectStreamParts,
  drainStream,
  encodeSSEChunked,
} from '@/test/utils/sse'

/**
 * Encode SSE events where the stream stays OPEN after the last chunk, mimicking
 * a live SSE connection that waits for server pushes. Consumers must explicitly
 * end the stream via the returned `end()` callback.
 */
function encodeSSEOpen(events: Array<Record<string, unknown>>): {
  stream: ReadableStream<Uint8Array>
  end: () => void
} {
  const encoder = new TextEncoder()
  const chunks = events.map((e) =>
    encoder.encode(`data: ${JSON.stringify(e)}\n\n`)
  )
  let index = 0
  let endController: ReadableStreamDefaultController<Uint8Array> | null = null
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      endController = controller
      if (index < chunks.length) {
        const chunk = chunks[index]
        if (chunk) controller.enqueue(chunk)
        index++
      }
      // Do NOT close when chunks exhausted — caller must invoke end().
    },
  })
  return {
    stream,
    end: () => endController?.close(),
  }
}

import { sendTaskCancel } from './a2a/cancelTask'
import { AssistantError } from './a2a/classifyError'
import { getA2AConfig } from './a2a/config'
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

vi.mock('./a2a/remoteToolResponse', () => ({
  sendRemoteToolResponse: vi.fn(() => Promise.resolve()),
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

  describe('handleToolResultContinuation', () => {
    it('finishes when continuation stream receives tool_call + request without a new step.complete', async () => {
      // Repro: parallel tool calls arrive fragmented across streams.
      // Stream 1 sees step.complete(tool_use) + tool_call_1, then closes after
      // req_1 is matched. Continuation stream 2 reads tool_call_2 +
      // REMOTE_TOOL_REQUEST_2 from the same still-open SSE, but the server
      // does NOT emit another step.complete. Stream 2 must still finish for
      // tool-calls so the client can send the second tool result.
      const model = new GrafanaAssistantLanguageModel()

      const openSSE = encodeSSEOpen([
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
                    toolName: 'addRuleBeginEnd',
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
              chatId: 'chat-fragment',
              toolName: 'addRuleBeginEnd',
              toolInput: {},
            },
          },
        },
        // Second tool_call + request arrive after the first stream closes.
        // Server does NOT emit a new step.complete for this tool.
        {
          jsonrpc: '2.0',
          id: 5,
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
                    toolName: 'addRuleJson',
                    inputs: {},
                  },
                },
              ],
            },
          },
        },
        {
          jsonrpc: '2.0',
          id: 6,
          result: {
            type: 'REMOTE_TOOL_REQUEST',
            data: {
              requestId: 'req-2',
              chatId: 'chat-fragment',
              toolName: 'addRuleJson',
              toolInput: {},
            },
          },
        },
      ])

      fetchSpy.mockResolvedValueOnce(makeSSEResponse(openSSE.stream))

      const first = await model.doStream(makeOptions('chat-fragment', 'Hello'))
      await drainStream(first.stream)

      const continuationOptions: LanguageModelV2CallOptions = {
        prompt: [
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolCallId: 'tool-1',
                toolName: 'addRuleBeginEnd',
                output: { type: 'json', value: 'ok' },
              },
            ],
          },
        ],
        providerOptions: { grafanaAssistant: { chatId: 'chat-fragment' } },
      } as unknown as LanguageModelV2CallOptions

      const second = await model.doStream(continuationOptions)
      const parts = await collectStreamParts(second.stream)

      openSSE.end()

      expect(
        parts.some(
          (p) => p.type === 'finish' && p.finishReason === 'tool-calls'
        )
      ).toBe(true)
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

  describe('error classification', () => {
    it('throws AssistantError with no-stack when config has no stack', async () => {
      vi.stubGlobal('fetch', fetchSpy)
      const getA2AConfigMock = vi.mocked(getA2AConfig)
      getA2AConfigMock.mockRejectedValueOnce(
        new Error(
          'No Grafana Cloud stack selected. Please sign in to Grafana Cloud first.'
        )
      )

      const model = new GrafanaAssistantLanguageModel()

      try {
        await model.doStream(makeOptions('chat-1', 'Hello'))
        expect.unreachable('should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(AssistantError)
        expect((error as AssistantError).errorInfo.category).toBe('no-stack')
      }
    })

    it('throws AssistantError with auth-expired when not authenticated', async () => {
      vi.stubGlobal('fetch', fetchSpy)
      const getA2AConfigMock = vi.mocked(getA2AConfig)
      getA2AConfigMock.mockRejectedValueOnce(
        new Error(
          'Not authenticated with Grafana Assistant. Please connect to Grafana Assistant first.'
        )
      )

      const model = new GrafanaAssistantLanguageModel()

      try {
        await model.doStream(makeOptions('chat-1', 'Hello'))
      } catch (error) {
        expect(error).toBeInstanceOf(AssistantError)
        expect((error as AssistantError).errorInfo.category).toBe(
          'auth-expired'
        )
      }
    })

    it('throws AssistantError with auth-expired for HTTP 401', async () => {
      vi.stubGlobal('fetch', fetchSpy)
      fetchSpy.mockResolvedValueOnce(
        new Response('Unauthorized', { status: 401 })
      )

      const model = new GrafanaAssistantLanguageModel()

      try {
        await model.doStream(makeOptions('chat-1', 'Hello'))
      } catch (error) {
        expect(error).toBeInstanceOf(AssistantError)
        expect((error as AssistantError).errorInfo.category).toBe(
          'auth-expired'
        )
      }
    })

    it('throws AssistantError with rate-limit for HTTP 429', async () => {
      vi.stubGlobal('fetch', fetchSpy)
      fetchSpy.mockResolvedValueOnce(
        new Response('Too many requests', { status: 429 })
      )

      const model = new GrafanaAssistantLanguageModel()

      try {
        await model.doStream(makeOptions('chat-1', 'Hello'))
      } catch (error) {
        expect(error).toBeInstanceOf(AssistantError)
        expect((error as AssistantError).errorInfo.category).toBe('rate-limit')
      }
    })

    it('throws AssistantError with quota-exceeded for HTTP 429 with quota message', async () => {
      vi.stubGlobal('fetch', fetchSpy)
      fetchSpy.mockResolvedValueOnce(
        new Response('RESOURCE_LIMIT_EXCEEDED: Monthly prompt limit reached', {
          status: 429,
        })
      )

      const model = new GrafanaAssistantLanguageModel()

      try {
        await model.doStream(makeOptions('chat-1', 'Hello'))
      } catch (error) {
        expect(error).toBeInstanceOf(AssistantError)
        expect((error as AssistantError).errorInfo.category).toBe(
          'quota-exceeded'
        )
      }
    })

    it('throws AssistantError with service-unavailable for HTTP 503', async () => {
      vi.stubGlobal('fetch', fetchSpy)
      fetchSpy.mockResolvedValueOnce(
        new Response('Service unavailable', { status: 503 })
      )

      const model = new GrafanaAssistantLanguageModel()

      try {
        await model.doStream(makeOptions('chat-1', 'Hello'))
      } catch (error) {
        expect(error).toBeInstanceOf(AssistantError)
        expect((error as AssistantError).errorInfo.category).toBe(
          'service-unavailable'
        )
      }
    })

    it('throws AssistantError with network for fetch TypeError', async () => {
      vi.stubGlobal('fetch', fetchSpy)
      fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const model = new GrafanaAssistantLanguageModel()

      try {
        await model.doStream(makeOptions('chat-1', 'Hello'))
      } catch (error) {
        expect(error).toBeInstanceOf(AssistantError)
        expect((error as AssistantError).errorInfo.category).toBe('network')
      }
    })
  })
})
