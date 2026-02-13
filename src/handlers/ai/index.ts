import { convertToModelMessages, streamText } from 'ai'
import { ipcMain, IpcMainEvent } from 'electron'
import log from 'electron-log/main'

import { getAiModel } from './model'
import { streamMessages } from './streamMessages'
import { tools } from './tools'
import { AiHandler, StreamChatRequest, AbortStreamChatRequest } from './types'

const PREFIX = '[ai:handler]'

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
  const aiModel = getAiModel()
  const messages = convertToModelMessages(request.messages)

  const abortController = new AbortController()
  activeAbortControllers.set(request.id, abortController)

  try {
    log.info(
      PREFIX,
      `handleStreamChat requestId=${request.id} messages=${messages.length}`
    )

    const response = streamText({
      model: aiModel,
      toolChoice: 'required',
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
    log.info(PREFIX, `handleStreamChat completed for requestId=${request.id}`)
  } catch (error) {
    log.error(
      PREFIX,
      `handleStreamChat error for requestId=${request.id}:`,
      error
    )
    throw error
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
