import { UIMessage, UIMessageChunk } from 'ai'

import { AiProvider } from '@/types/features'

export enum AiHandler {
  StreamChat = 'ai:streamChat',
  StreamChatChunk = 'ai:streamChatChunk',
  StreamChatEnd = 'ai:streamChatEnd',
  AbortStreamChat = 'ai:abortStreamChat',
}

export interface StreamChatRequest {
  id: string
  trigger: 'submit-message' | 'regenerate-message'
  messageId?: string
  messages: UIMessage[]
  headers?: Record<string, string>
  body?: object
  provider?: AiProvider
}

export interface StreamChatChunk {
  id: string
  chunk?: UIMessageChunk
}

export interface StreamChatEnd {
  id: string
}

export interface AbortStreamChatRequest {
  id: string
}
