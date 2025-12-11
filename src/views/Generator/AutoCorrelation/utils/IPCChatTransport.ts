import {
  ChatRequestOptions,
  ChatTransport,
  UIMessage,
  UIMessageChunk,
} from 'ai'

import {
  StreamChatChunk,
  StreamChatRequest,
  TokenUsage,
} from '@/handlers/ai/types'

export interface IPCChatTransportOptions {
  onUsage?: (usage: TokenUsage) => void
}

/**
 * Custom ChatTransport implementation that uses Electron IPC for communication
 * between renderer and main process for AI streaming responses.
 */
export class IPCChatTransport<Message extends UIMessage>
  implements ChatTransport<Message>
{
  private onUsage?: (usage: TokenUsage) => void

  constructor(options?: IPCChatTransportOptions) {
    this.onUsage = options?.onUsage
  }
  sendMessages(
    options: {
      trigger: 'submit-message' | 'regenerate-message'
      chatId: string
      messageId: string | undefined
      messages: Message[]
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

    // Capture callback reference for use inside start()
    const onUsageCallback = this.onUsage

    // Create a ReadableStream that will receive chunks via IPC
    return Promise.resolve(
      new ReadableStream<UIMessageChunk>({
        start(controller) {
          const stream = window.studio.ai.streamChat(request)

          // Set up listeners for stream events
          const removeChunkListener = stream.onChunk(
            (data: StreamChatChunk) => {
              controller.enqueue(data.chunk)

              if (data.chunk?.type === 'error') {
                controller.close()
                cleanup()
              }
            }
          )

          const removeEndListener = stream.onEnd((usage) => {
            if (usage && onUsageCallback) {
              onUsageCallback(usage)
            }
            controller.close()
            cleanup()
          })

          // Handle abort signal
          if (options.abortSignal) {
            options.abortSignal.addEventListener('abort', () => {
              stream.abort()
              // Need to call error to stop the stream immediately,
              // calling close would still proccess enqueued chunks
              controller.error()
              cleanup()
            })
          }

          const cleanup = () => {
            removeChunkListener()
            removeEndListener()
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
