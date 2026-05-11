import { captureException } from '@sentry/electron/main'
import { convertToModelMessages, ModelMessage, streamText } from 'ai'
import { ipcMain, IpcMainEvent } from 'electron'
import log from 'electron-log/main'

import { stripUndefined } from '@/utils/object'

import * as assistantAuth from './a2a/assistantAuth'
import { GrafanaAssistantLanguageModel } from './grafanaAssistantProvider'
import { streamMessages } from './streamMessages'
import { tools } from './tools'
import { AiHandler, StreamChatRequest, AbortStreamChatRequest } from './types'

const grafanaAssistantModel = new GrafanaAssistantLanguageModel()

const activeAbortControllers = new Map<string, AbortController>()

export function initialize() {
  ipcMain.on(AiHandler.StreamChat, handleStreamChat)
  ipcMain.on(AiHandler.AbortStreamChat, handleAbortStreamChat)
  assistantAuth.initialize()
}

export async function handleStreamChat(
  event: IpcMainEvent,
  request: StreamChatRequest
) {
  const abortController = new AbortController()
  activeAbortControllers.set(request.id, abortController)

  try {
    const messages = sanitizeModelMessages(
      convertToModelMessages(request.messages)
    )

    const response = streamText({
      model: grafanaAssistantModel,
      messages,
      tools,
      abortSignal: abortController.signal,
      providerOptions: {
        grafanaAssistant: {
          chatId: request.id,
        },
      },
    })

    await streamMessages(event.sender, response, request.id)
  } catch (error) {
    if (abortController.signal.aborted) {
      return
    }

    log.error('handleStreamChat error:', error)
    captureException(error, { tags: { component: 'ai-chat' } })

    event.sender.send(AiHandler.StreamChatChunk, {
      id: request.id,
      chunk: {
        type: 'error',
        errorText: error instanceof Error ? error.message : 'Unknown error',
      },
    })
    event.sender.send(AiHandler.StreamChatEnd, {
      id: request.id,
    })
  } finally {
    activeAbortControllers.delete(request.id)
  }
}

// AI SDK's Zod schema rejects `undefined` in tool-result outputs.
// Strip undefined-valued keys before validation.
function sanitizeModelMessages(messages: ModelMessage[]): ModelMessage[] {
  return messages.map((message) => {
    if (message.role !== 'tool') return message

    return {
      ...message,
      content: message.content.map((part) => {
        if (part.type !== 'tool-result') return part

        return {
          ...part,
          output: stripUndefined(part.output) as typeof part.output,
        }
      }),
    }
  })
}

function handleAbortStreamChat(
  _event: IpcMainEvent,
  request: AbortStreamChatRequest
) {
  const abortController = activeAbortControllers.get(request.id)

  if (!abortController) {
    return
  }

  abortController.abort()
  activeAbortControllers.delete(request.id)
}
