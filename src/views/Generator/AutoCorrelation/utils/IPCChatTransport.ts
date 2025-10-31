import {
  ChatTransport,
  ChatRequestOptions,
  UIMessage,
  UIMessageChunk,
} from 'ai'

import { StreamChatRequest, StreamChatChunk } from '@/handlers/ai/types'

/**
 * Custom ChatTransport implementation that uses Electron IPC for communication
 * between renderer and main process for AI streaming responses.
 */
export class IPCChatTransport<UI_MESSAGE extends UIMessage>
  implements ChatTransport<UI_MESSAGE>
{
  sendMessages(
    options: {
      trigger: 'submit-message' | 'regenerate-message'
      chatId: string
      messageId: string | undefined
      messages: UI_MESSAGE[]
      abortSignal: AbortSignal | undefined
    } & ChatRequestOptions
  ): Promise<ReadableStream<UIMessageChunk>> {
    const headers =
      options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : options.headers

    const request: StreamChatRequest = {
      id: options.chatId,
      trigger: options.trigger,
      messageId: options.messageId,
      messages: options.messages,
      headers,
      body: options.body,
    }

    // Create a ReadableStream that will receive chunks via IPC
    return Promise.resolve(
      new ReadableStream<UIMessageChunk>({
        start(controller) {
          const stream = window.studio.ai.streamChat(request)

          // Set up listeners for stream events
          const removeChunkListener = stream.onChunk(
            (data: StreamChatChunk) => {
              controller.enqueue(data.chunk)
            }
          )

          const removeEndListener = stream.onEnd(() => {
            controller.close()
            cleanup()
          })

          const removeErrorListener = stream.onError((error) => {
            controller.error(new Error(error))
            cleanup()
          })

          // Handle abort signal
          if (options.abortSignal) {
            options.abortSignal.addEventListener('abort', () => {
              controller.error(new Error('Aborted'))
              cleanup()
            })
          }

          const cleanup = () => {
            removeChunkListener()
            removeEndListener()
            removeErrorListener()
          }
        },
      })
    )
  }

  reconnectToStream(
    _options: {
      chatId: string
    } & ChatRequestOptions
  ): Promise<ReadableStream<UIMessageChunk> | null> {
    // Not implemented
    return Promise.resolve(null)
  }
}
