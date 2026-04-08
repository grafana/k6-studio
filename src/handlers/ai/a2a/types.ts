import type { A2AConfig } from './config'

export type A2ATaskState =
  | 'submitted'
  | 'working'
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'input-required'
  | 'rejected'
  | 'auth-required'

export interface A2AStatusUpdateEvent {
  kind: 'status-update'
  taskId: string
  contextId: string
  status: {
    state: A2ATaskState
    message?: { parts?: Array<{ text?: string }> }
  }
  final?: boolean
}

export interface A2ATextPart {
  kind: 'text'
  text: string
}

export interface A2ADataPart {
  kind: 'data'
  data: Record<string, unknown>
}

export type A2AArtifactPart = A2ATextPart | A2ADataPart

export interface A2ACost {
  inputCost: number
  outputCost: number
  cacheReadCost: number
  cacheCreationCost: number
  totalCost: number
  currency: string
}

export interface A2ATokenUsage {
  InputTokens?: number
  OutputTokens?: number
  CacheCreationInputTokens?: number
  CacheReadInputTokens?: number
  Model?: string
  Provider?: string
  Cost?: A2ACost
}

export interface A2AArtifactMetadata {
  'agent-traceability'?: {
    usage?: A2ATokenUsage
  }
  model?: string
  provider?: string
}

export interface A2AArtifact {
  kind: string
  artifactId: string
  name: string
  description?: string
  parts: A2AArtifactPart[]
  index?: number
  lastChunk?: boolean
  metadata?: A2AArtifactMetadata
}

export interface A2AArtifactUpdateEvent {
  kind: 'artifact-update'
  taskId: string
  contextId: string
  artifact: A2AArtifact
}

export interface A2ARemoteToolRequestEvent {
  type: 'REMOTE_TOOL_REQUEST'
  data: {
    requestId: string
    chatId: string
    toolName: string
    toolInput: Record<string, unknown>
    timeoutMs?: number
  }
}

export interface A2AToolCallData {
  toolId: string
  toolName: string
  inputs?: Record<string, unknown> | string
}

export type A2ASSEResult =
  | A2AStatusUpdateEvent
  | A2AArtifactUpdateEvent
  | A2ARemoteToolRequestEvent

export interface A2ASSEEvent {
  jsonrpc: string
  id: string | number
  result?: A2ASSEResult
  error?: { code: number; message: string; data?: string }
}

export interface PendingToolRequest {
  requestId: string
  chatId: string
}

export type A2ASessionConfig = Omit<A2AConfig, 'extensions'>

export interface ActiveA2ASession {
  reader: ReadableStreamDefaultReader<Uint8Array>
  contextId: string | undefined
  taskId: string | undefined
  sessionAbortController: AbortController
  config: A2ASessionConfig
  /** Maps toolId (from step.toolCall) → remote tool request info */
  pendingToolRequests: Map<string, PendingToolRequest>
  /** Queue of tool calls that haven't been matched to a REMOTE_TOOL_REQUEST yet */
  unmatchedToolCalls: Array<{ toolId: string; toolName: string }>
  /** Queue of remote requests that haven't been matched to a step.toolCall yet */
  unmatchedRemoteRequests: Array<{
    requestId: string
    chatId: string
    toolName: string
  }>
  /** Leftover bytes from SSE parsing between reads */
  sseBuffer: string
  /** Set to true when all emitted tool calls have been matched with REMOTE_TOOL_REQUESTs */
  readyToFinishForTools: boolean
  /** Artifact ID of the active token-streaming block (set by message.stream.start) */
  activeStreamArtifactId: string | undefined
  /** Content type of the currently open streaming block ('text' | 'reasoning') */
  activeStreamContentType: 'text' | 'reasoning' | undefined
}
