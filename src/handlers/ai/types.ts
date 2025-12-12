import { LanguageModelUsage, UIMessage, UIMessageChunk } from 'ai'

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
}

export interface StreamChatChunk {
  id: string
  chunk?: UIMessageChunk
}

export type TokenUsage = LanguageModelUsage

export interface StreamChatEnd {
  id: string
  usage?: TokenUsage
}

export interface AbortStreamChatRequest {
  id: string
}
