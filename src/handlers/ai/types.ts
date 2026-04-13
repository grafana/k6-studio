import { LanguageModelUsage, UIMessage, UIMessageChunk } from 'ai'

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

export type TokenUsage = LanguageModelUsage

export interface StreamChatEnd {
  id: string
  usage?: TokenUsage
}

export interface AbortStreamChatRequest {
  id: string
}

export enum AssistantAuthHandler {
  SignIn = 'ai:assistant-auth',
  CancelSignIn = 'ai:assistant-cancel-sign-in',
  GetStatus = 'ai:assistant-auth-status',
  SignOut = 'ai:assistant-sign-out',
  VerificationCode = 'ai:assistant-verification-code',
  CheckStackHealth = 'ai:assistant-check-stack-health',
}
