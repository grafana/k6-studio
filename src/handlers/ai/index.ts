import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import { convertToModelMessages, streamText } from 'ai'
import { ipcMain, IpcMainEvent } from 'electron'

import { setupAiModel } from './model'
import { streamMessages } from './streamMessages'
import { tools } from './tools'
import { AiHandler, StreamChatRequest, AbortStreamChatRequest } from './types'

// Store active AbortControllers indexed by request ID
const activeAbortControllers = new Map<string, AbortController>()

export function initialize() {
  ipcMain.on(AiHandler.StreamChat, handleStreamChat)
  ipcMain.on(AiHandler.AbortStreamChat, handleAbortStreamChat)
}

async function handleStreamChat(
  event: IpcMainEvent,
  request: StreamChatRequest
) {
  const aiModel = await setupAiModel()
  const messages = convertToModelMessages(request.messages)

  const abortController = new AbortController()
  activeAbortControllers.set(request.id, abortController)

  try {
    const response = streamText({
      model: aiModel,
      toolChoice: 'required',
      messages,
      tools,
      abortSignal: abortController.signal,
      providerOptions: {
        openai: {
          parallelToolCalls: false,
        } satisfies OpenAIResponsesProviderOptions,
      },
    })

    await streamMessages(event.sender, response, request.id)
  } finally {
    // Clean up the AbortController after streaming completes or fails
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
