import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import { convertToModelMessages, streamText } from 'ai'
import { ipcMain, IpcMainEvent } from 'electron'
import log from 'electron-log/main'

import * as assistantAuth from './a2a/assistantAuth'
import { getGrafanaAssistantModel, getOpenAiModel } from './model'
import { streamMessages } from './streamMessages'
import { tools } from './tools'
import { AiHandler, StreamChatRequest, AbortStreamChatRequest } from './types'

// Store active AbortControllers indexed by request ID
const activeAbortControllers = new Map<string, AbortController>()

export function initialize() {
  ipcMain.on(AiHandler.StreamChat, handleStreamChat)
  ipcMain.on(AiHandler.AbortStreamChat, handleAbortStreamChat)
  assistantAuth.initialize()
}

async function handleStreamChat(
  event: IpcMainEvent,
  request: StreamChatRequest
) {
  const provider = request.provider ?? 'openai'
  const messages = convertToModelMessages(request.messages)

  const abortController = new AbortController()
  activeAbortControllers.set(request.id, abortController)

  try {
    if (provider === 'grafana-assistant') {
      const aiModel = getGrafanaAssistantModel()

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

      await streamMessages(event.sender, response, request.id, false)
    } else {
      const aiModel = await getOpenAiModel()

      const response = streamText({
        model: aiModel,
        messages,
        tools,
        abortSignal: abortController.signal,
        providerOptions: {
          openai: {
            parallelToolCalls: false,
            reasoningEffort: 'low',
            textVerbosity: 'low',
            // Disable storing of conversations, required for orgs with zero data retention
            store: false,
          } satisfies OpenAIResponsesProviderOptions,
        },
      })

      await streamMessages(event.sender, response, request.id, true)
    }
  } catch (error) {
    log.error('handleStreamChat error:', error)
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
