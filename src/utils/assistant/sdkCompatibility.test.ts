import type {
  LanguageModelV2,
  LanguageModelV2StreamPart,
} from '@ai-sdk/provider'
import { Chat } from '@ai-sdk/react'
import {
  type ChatInit,
  type UIMessage,
  convertToModelMessages,
  jsonSchema,
  streamText,
  tool,
} from 'ai'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { createTerminalToolGuard } from './chat'
import { recordingSearchTools, serializeToolDefinitions } from './tools'

function toolResponse(toolName: string): LanguageModelV2StreamPart[] {
  return [
    { type: 'stream-start', warnings: [] },
    { type: 'tool-call', toolCallId: toolName, toolName, input: '{}' },
    {
      type: 'finish',
      finishReason: 'tool-calls',
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    },
  ]
}

function createModel(responses: LanguageModelV2StreamPart[][]) {
  const doStream = vi.fn<LanguageModelV2['doStream']>(() =>
    Promise.resolve({
      stream: new ReadableStream({
        start(controller) {
          const response = responses.shift()
          if (!response) throw new Error('Unexpected assistant continuation')
          response.forEach((part) => controller.enqueue(part))
          controller.close()
        },
      }),
    })
  )

  const model: LanguageModelV2 = {
    specificationVersion: 'v2',
    provider: 'test',
    modelId: 'assistant',
    supportedUrls: {},
    doGenerate: () => {
      throw new Error('Only streaming is supported')
    },
    doStream,
  }

  return { model, doStream }
}

describe('Assistant SDK compatibility', () => {
  it('returns client tool outputs through a v2 provider and finishes the terminal continuation', async () => {
    const { model, doStream } = createModel([
      toolResponse('getRequestsMetadata'),
      toolResponse('finish'),
      [
        {
          type: 'finish',
          finishReason: 'stop',
          usage: { inputTokens: 1, outputTokens: 0, totalTokens: 1 },
        },
      ],
    ])
    const definitions = serializeToolDefinitions({
      ...recordingSearchTools,
      finish: tool({ inputSchema: z.object({}) }),
    })
    const tools = Object.fromEntries(
      definitions.map((definition) => [
        definition.name,
        tool({ inputSchema: jsonSchema(definition.inputSchema) }),
      ])
    )
    const onError = vi.fn()
    const onToolCall = vi.fn<NonNullable<ChatInit<UIMessage>['onToolCall']>>(
      ({ toolCall }) => {
        void chat.addToolOutput({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: { ok: true },
        })
      }
    )
    const chat = new Chat({
      transport: {
        async sendMessages({ messages }) {
          return streamText({
            model,
            tools,
            messages: await convertToModelMessages(messages),
          }).toUIMessageStream()
        },
        reconnectToStream: () => Promise.resolve(null),
      },
      sendAutomaticallyWhen: createTerminalToolGuard('finish').guard,
      onToolCall,
      onError,
    })

    await chat.sendMessage({ text: 'Inspect the recording' })

    expect(onError).not.toHaveBeenCalled()
    expect(chat.status).toBe('ready')
    expect(doStream).toHaveBeenCalledTimes(3)
    expect(onToolCall).toHaveBeenCalledTimes(2)
    expect(onToolCall.mock.calls[0]?.[0]).toMatchObject({
      toolCall: {
        toolName: 'getRequestsMetadata',
        input: {},
      },
    })
    expect(doStream.mock.calls[1]?.[0].prompt.at(-1)).toMatchObject({
      role: 'tool',
      content: [
        {
          type: 'tool-result',
          toolName: 'getRequestsMetadata',
          output: { type: 'json', value: { ok: true } },
        },
      ],
    })
    expect(doStream.mock.calls[2]?.[0].prompt.at(-1)).toMatchObject({
      role: 'tool',
      content: [
        {
          type: 'tool-result',
          toolName: 'finish',
          output: { type: 'json', value: { ok: true } },
        },
      ],
    })
  })
})
