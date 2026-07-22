import {
  ChatRequestOptions,
  ChatTransport,
  UIMessage,
  UIMessageChunk,
} from 'ai'

import {
  RemoteToolDefinition,
  StreamChatChunk,
  StreamChatRequest,
} from '@/handlers/ai/types'

interface IPCChatTransportOptions {
  /** Tool definitions for the agent driving this chat. */
  tools: RemoteToolDefinition[]
}

/**
 * Custom ChatTransport implementation that uses Electron IPC for communication
 * between renderer and main process for AI streaming responses.
 */
export class IPCChatTransport<
  Message extends UIMessage,
> implements ChatTransport<Message> {
  constructor(private readonly options: IPCChatTransportOptions) {}

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
      tools: this.options.tools,
      headers,
      body: options.body,
    }

    // Chunks can keep arriving over IPC after the stream settles (the main
    // process does not stop immediately), so every controller call is
    // guarded; otherwise enqueue/close throw on a settled stream.
    let isSettled = false
    let cleanup = () => {}
    let abortStream = () => {}

    return Promise.resolve(
      new ReadableStream<UIMessageChunk>({
        start(controller) {
          const stream = window.studio.ai.streamChat(request)
          abortStream = () => stream.abort()

          const settle = (action: () => void) => {
            if (isSettled) {
              return
            }

            isSettled = true
            action()
            cleanup()
          }

          const removeChunkListener = stream.onChunk(
            (data: StreamChatChunk) => {
              if (data.chunk === undefined || isSettled) {
                return
              }

              controller.enqueue(data.chunk)

              if (data.chunk.type === 'error') {
                settle(() => controller.close())
              }
            }
          )

          const removeEndListener = stream.onEnd(() => {
            settle(() => controller.close())
          })

          if (options.abortSignal) {
            options.abortSignal.addEventListener('abort', () => {
              stream.abort()
              // Need to call error to stop the stream immediately,
              // calling close would still proccess enqueued chunks
              settle(() => controller.error())
            })
          }

          cleanup = () => {
            removeChunkListener()
            removeEndListener()
          }
        },
        cancel() {
          // The consumer (useChat) tears the stream down, e.g. after a chat
          // error. Stop the main-process stream and detach the listeners.
          isSettled = true
          abortStream()
          cleanup()
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
