import { convertToModelMessages, streamText } from 'ai'
import { ipcMain, IpcMainEvent } from 'electron'
import log from 'electron-log/main'

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
  const messages = convertToModelMessages(request.messages)

  const abortController = new AbortController()
  activeAbortControllers.set(request.id, abortController)

  try {
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
