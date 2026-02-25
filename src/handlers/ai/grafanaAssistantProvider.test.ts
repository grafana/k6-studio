import type { LanguageModelV2CallOptions } from '@ai-sdk/provider'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GrafanaAssistantLanguageModel } from './grafanaAssistantProvider'

vi.mock('electron-log/main', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('./tools', () => ({
  getToolDefinitionsForA2A: () => [],
}))

vi.mock('./a2a/config', () => ({
  a2aConfig: {
    baseUrl: 'http://test-a2a',
    agentId: 'test-agent',
    remoteToolExtension: 'test-ext',
    scopeOrgId: 'test-org',
    grafanaUrl: 'http://test-grafana',
    grafanaApiKey: 'test-key',
  },
}))

/**
 * Creates a ReadableStream where each SSE event is a separate chunk,
 * delivered one per pull() call. This is required for the stream's
 * readyToFinishForTools logic to work between pull cycles.
 */
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

function makeSSEResponse(sseStream: ReadableStream<Uint8Array>): Response {
  return new Response(sseStream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
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

async function drainStream(
  result: Awaited<ReturnType<GrafanaAssistantLanguageModel['doStream']>>
): Promise<void> {
  const reader = result.stream.getReader()
  while (!(await reader.read()).done) {
    /* consume */
  }
}

describe('GrafanaAssistantLanguageModel', () => {
  const fetchSpy =
    vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('handleNewMessage contextId preservation', () => {
    it('passes contextId from previous session in the next request', async () => {
      vi.stubGlobal('fetch', fetchSpy)

      const model = new GrafanaAssistantLanguageModel()

      // First call: SSE stream finishes with tool-calls, keeping session alive.
      // The status-update sets contextId on the session, and the tool-call +
      // REMOTE_TOOL_REQUEST matching causes a tool-calls finish (no cleanup).
      fetchSpy.mockResolvedValueOnce(
        makeSSEResponse(
          encodeSSEChunked([
            {
              jsonrpc: '2.0',
              id: 1,
              result: {
                kind: 'status-update',
                taskId: 't1',
                contextId: 'ctx-from-server',
                status: { state: 'working' },
              },
            },
            {
              jsonrpc: '2.0',
              id: 2,
              result: {
                kind: 'artifact-update',
                taskId: 't1',
                contextId: 'ctx-from-server',
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
        )
      )

      const firstResult = await model.doStream(
        makeOptions('chat-1', 'First message')
      )
      await drainStream(firstResult)

      // Second call: new user message (no tool results) → handleNewMessage.
      // The contextId from the surviving session should be included.
      fetchSpy.mockResolvedValueOnce(
        makeSSEResponse(
          encodeSSEChunked([
            {
              jsonrpc: '2.0',
              id: 4,
              result: {
                kind: 'status-update',
                taskId: 't2',
                contextId: 'ctx-from-server',
                status: { state: 'completed' },
              },
            },
          ])
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
})
