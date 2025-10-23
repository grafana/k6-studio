import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import { convertToModelMessages, streamText } from 'ai'
import { ipcMain, IpcMainEvent } from 'electron'

import { setupAiModel } from './model'
import { streamMessages } from './stream-messages'
import { tools } from './tools'
import { AiHandler, StreamChatRequest } from './types'

export function initialize() {
  ipcMain.on(AiHandler.StreamChat, handleStreamChat)
}

async function handleStreamChat(
  event: IpcMainEvent,
  request: StreamChatRequest
) {
  const aiModel = await setupAiModel()
  const messages = convertToModelMessages(request.messages)

  const response = streamText({
    model: aiModel,
    toolChoice: 'required',
    messages,
    tools,
    providerOptions: {
      openai: {
        parallelToolCalls: false,
      } satisfies OpenAIResponsesProviderOptions,
    },
  })

  await streamMessages(event.sender, response, request.id)
}
