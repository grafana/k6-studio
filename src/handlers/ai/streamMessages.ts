import type { LanguageModelV2StreamPart } from '@ai-sdk/provider'
import { StreamTextResult, ToolSet } from 'ai'

import { AiHandler } from './types'

export async function streamMessages<Tools extends ToolSet, PARTIAL_OUTPUT>(
  webContents: Electron.WebContents,
  response: StreamTextResult<Tools, PARTIAL_OUTPUT>,
  requestId: string
): Promise<void> {
  const stream = response.toUIMessageStream({})

  for await (const part of stream) {
    webContents.send(AiHandler.StreamChatChunk, {
      id: requestId,
      chunk: part,
    })
  }

  const usageData = await response.usage

  webContents.send(AiHandler.StreamChatEnd, {
    id: requestId,
    usage: usageData,
  })
}

/**
 * Stream directly from a LanguageModelV2 doStream output, bypassing the
 * AI SDK's streamText pipeline which buffers text-delta parts internally.
 */
export async function streamFromDoStream(
  webContents: Electron.WebContents,
  stream: ReadableStream<LanguageModelV2StreamPart>,
  requestId: string
): Promise<void> {
  const reader = stream.getReader()
  let stepStarted = false

  send(webContents, requestId, { type: 'start' })

  let result = await reader.read()
  while (!result.done) {
    const part = result.value

    switch (part.type) {
      case 'text-start': {
        if (!stepStarted) {
          send(webContents, requestId, { type: 'start-step' })
          stepStarted = true
        }
        send(webContents, requestId, { type: 'text-start', id: part.id })
        break
      }
      case 'text-delta':
        send(webContents, requestId, {
          type: 'text-delta',
          id: part.id,
          delta: part.delta,
        })
        break
      case 'text-end':
        send(webContents, requestId, { type: 'text-end', id: part.id })
        break
      case 'reasoning-start': {
        if (!stepStarted) {
          send(webContents, requestId, { type: 'start-step' })
          stepStarted = true
        }
        send(webContents, requestId, {
          type: 'reasoning-start',
          id: part.id,
        })
        break
      }
      case 'reasoning-delta':
        send(webContents, requestId, {
          type: 'reasoning-delta',
          id: part.id,
          delta: part.delta,
        })
        break
      case 'reasoning-end':
        send(webContents, requestId, { type: 'reasoning-end', id: part.id })
        break
      case 'tool-call':
        if (!stepStarted) {
          send(webContents, requestId, { type: 'start-step' })
          stepStarted = true
        }
        send(webContents, requestId, {
          type: 'tool-call',
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          args: part.input,
        })
        break
      case 'tool-result':
        send(webContents, requestId, {
          type: 'tool-result',
          toolCallId: part.toolCallId,
          result: part.result,
        })
        break
      case 'finish':
        send(webContents, requestId, { type: 'finish-step' })
        send(webContents, requestId, {
          type: 'finish',
          finishReason: part.finishReason,
        })
        stepStarted = false
        break
      case 'error':
        send(webContents, requestId, {
          type: 'error',
          errorText:
            part.error instanceof Error ? part.error.message : 'Unknown error',
        })
        break
      default:
        break
    }

    result = await reader.read()
  }

  webContents.send(AiHandler.StreamChatEnd, { id: requestId })
}

function send(
  webContents: Electron.WebContents,
  requestId: string,
  chunk: Record<string, unknown>
): void {
  webContents.send(AiHandler.StreamChatChunk, { id: requestId, chunk })
}
