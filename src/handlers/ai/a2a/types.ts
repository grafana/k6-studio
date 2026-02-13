export interface A2AStatusUpdateEvent {
  kind: 'status-update'
  taskId: string
  contextId: string
  status: { state: string; message?: { parts?: Array<{ text?: string }> } }
  final?: boolean
}

export interface A2AArtifactPart {
  kind: string
  text?: string
  data?: Record<string, unknown>
}

export interface A2AArtifact {
  name: string
  artifactId: string
  parts: A2AArtifactPart[]
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

export interface A2AStepCompleteData {
  stepId?: string
  stopReason?: string
  usage?: { inputTokens?: number; outputTokens?: number }
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

export interface ActiveA2ASession {
  reader: ReadableStreamDefaultReader<Uint8Array>
  contextId: string | undefined
  taskId: string | undefined
  sessionAbortController: AbortController
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
}
