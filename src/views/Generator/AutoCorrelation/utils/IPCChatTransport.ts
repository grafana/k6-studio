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
import { AiProvider } from '@/types/features'

interface IPCChatTransportOptions {
  provider: AiProvider
  onUsage?: (usage: TokenUsage) => void
}

/**
 * Custom ChatTransport implementation that uses Electron IPC for communication
 * between renderer and main process for AI streaming responses.
 */
export class IPCChatTransport<
  Message extends UIMessage,
> implements ChatTransport<Message> {
  private provider: AiProvider
  private onUsage?: (usage: TokenUsage) => void

  constructor(options: IPCChatTransportOptions) {
    this.provider = options.provider
    this.onUsage = options.onUsage
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
      provider: this.provider,
    }

    const onUsage = this.onUsage

    return Promise.resolve(
      new ReadableStream<UIMessageChunk>({
        start(controller) {
          const stream = window.studio.ai.streamChat(request)

          const removeChunkListener = stream.onChunk(
            (data: StreamChatChunk) => {
              controller.enqueue(data.chunk)

              if (data.chunk?.type === 'error') {
                controller.close()
                cleanup()
              }
            }
          )

          const removeEndListener = stream.onEnd((data) => {
            if (data.usage && onUsage) {
              onUsage(data.usage)
            }
            controller.close()
            cleanup()
          })

          if (options.abortSignal) {
            options.abortSignal.addEventListener('abort', () => {
              stream.abort()
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
    return Promise.resolve(null)
  }
}
