import { UIMessage, UIMessageChunk } from 'ai'

export enum AiHandler {
  StreamChat = 'ai:streamChat',
  StreamChatChunk = 'ai:streamChatChunk',
  StreamChatEnd = 'ai:streamChatEnd',
  StreamChatError = 'ai:streamChatError',
  AbortStreamChat = 'ai:abortStreamChat',
}

export interface StreamChatRequest {
  id: string
  trigger: 'submit-message' | 'regenerate-message'
  messageId?: string
  messages: UIMessage[]
  headers?: Record<string, string>
  body?: object
}

export interface StreamChatChunk {
  id: string
  chunk?: UIMessageChunk
}

export interface StreamChatEnd {
  id: string
}

export interface StreamChatError {
  id: string
  error: string
}

export interface AbortStreamChatRequest {
  id: string
}
