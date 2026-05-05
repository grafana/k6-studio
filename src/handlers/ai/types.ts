import { UIMessage, UIMessageChunk } from 'ai'

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

export interface StreamChatEnd {
  id: string
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
  WakeStack = 'ai:assistant-wake-stack',
}
