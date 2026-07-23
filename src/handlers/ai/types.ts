import { JSONSchema7, UIMessage, UIMessageChunk } from 'ai'
import { z } from 'zod'

export enum AiHandler {
  StreamChat = 'ai:streamChat',
  StreamChatChunk = 'ai:streamChatChunk',
  StreamChatEnd = 'ai:streamChatEnd',
  AbortStreamChat = 'ai:abortStreamChat',
}

export interface RemoteToolDefinition {
  name: string
  description: string
  inputSchema: JSONSchema7
}

export const RemoteToolDefinitionSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  inputSchema: z.custom<JSONSchema7>(
    (value) => typeof value === 'object' && value !== null
  ),
}) satisfies z.ZodType<RemoteToolDefinition>

export interface StreamChatRequest {
  id: string
  trigger: 'submit-message' | 'regenerate-message'
  messageId?: string
  messages: UIMessage[]
  /** Tool definitions provided by the renderer-side agent driving this chat. */
  tools: RemoteToolDefinition[]
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
