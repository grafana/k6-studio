import type { LanguageModelV2StreamPart } from '@ai-sdk/provider'
import log from 'electron-log/main'

import { ARTIFACT_NAME, LOG_PREFIX, NO_USAGE } from './constants'
import type { ActiveA2ASession } from './session'
import type {
  A2AArtifact,
  A2AArtifactPart,
  A2AArtifactUpdateEvent,
  A2ADataPart,
  A2ARemoteToolRequestEvent,
  A2ASSEEvent,
  A2ASSEResult,
  A2AStatusUpdateEvent,
  A2ATaskState,
  A2AToolCallData,
} from './types'

function isDataPart(part: A2AArtifactPart): part is A2ADataPart {
  return part.kind === 'data'
}

function isRemoteToolRequest(
  result: A2ASSEResult
): result is A2ARemoteToolRequestEvent {
  return 'type' in result && result.type === 'REMOTE_TOOL_REQUEST'
}

function isStatusUpdate(result: A2ASSEResult): result is A2AStatusUpdateEvent {
  return 'kind' in result && result.kind === 'status-update'
}

function isArtifactUpdate(
  result: A2ASSEResult
): result is A2AArtifactUpdateEvent {
  return 'kind' in result && result.kind === 'artifact-update'
}

export function processA2AEvent(
  event: A2ASSEEvent,
  session: ActiveA2ASession
): LanguageModelV2StreamPart[] {
  if (event.error) {
    log.error(
      LOG_PREFIX,
      `A2A error (${event.error.code}):`,
      event.error.message
    )
    return [
      {
        type: 'error',
        error: new Error(
          `A2A error (${event.error.code}): ${event.error.message}`
        ),
      },
    ]
  }

  const result = event.result
  if (!result) {
    return []
  }

  if (isRemoteToolRequest(result)) {
    session.handleRemoteToolRequest(result)
    return []
  }

  if (isStatusUpdate(result)) {
    return handleStatusUpdate(session, result)
  }

  if (isArtifactUpdate(result)) {
    return handleArtifactUpdate(session, result)
  }

  return []
}

const TERMINAL_ERROR_STATES: ReadonlySet<A2ATaskState> = new Set([
  'failed',
  'canceled',
  'rejected',
  'auth-required',
])

function handleStatusUpdate(
  session: ActiveA2ASession,
  event: A2AStatusUpdateEvent
): LanguageModelV2StreamPart[] {
  session.taskId = event.taskId
  session.contextId = event.contextId

  const state = event.status.state

  if (state === 'completed') {
    // Usage is reported per-step via step.complete artifacts, not here
    return [
      {
        type: 'finish',
        finishReason: 'stop',
        usage: NO_USAGE,
      },
    ]
  }

  if (state === 'input-required') {
    log.warn(
      LOG_PREFIX,
      `Task entered input-required state (taskId=${event.taskId})`
    )
    return [{ type: 'error', error: new Error('A2A task requires input') }]
  }

  if (TERMINAL_ERROR_STATES.has(state)) {
    const statusMessage = event.status.message?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join(' ')

    const errorMessage =
      statusMessage || `A2A task ${state} (taskId=${event.taskId})`

    log.error(LOG_PREFIX, `Task ${state}:`, errorMessage)
    return [{ type: 'error', error: new Error(errorMessage) }]
  }

  return []
}

function handleArtifactUpdate(
  session: ActiveA2ASession,
  event: A2AArtifactUpdateEvent
): LanguageModelV2StreamPart[] {
  const { artifact } = event

  switch (artifact.name) {
    case ARTIFACT_NAME.STEP_TOOL_CALL:
      return handleToolCallArtifact(session, artifact)
    case ARTIFACT_NAME.STEP_COMPLETE:
      return handleStepComplete(session, artifact)
    case ARTIFACT_NAME.STEP_MESSAGE:
      return handleMessageArtifact(session, artifact)
    case ARTIFACT_NAME.MESSAGE_STREAM_START:
    case ARTIFACT_NAME.MESSAGE_CONTENT_DELTA:
    case ARTIFACT_NAME.MESSAGE_STREAM_COMPLETE:
      return handleTokenStreamArtifact(session, artifact)
    case ARTIFACT_NAME.STEP_TOOL_RESULT:
      return []
    default:
      log.warn(LOG_PREFIX, `Unknown artifact name: ${artifact.name}`)
      return []
  }
}

function isToolCallData(
  data: Record<string, unknown>
): data is Record<string, unknown> & A2AToolCallData {
  return typeof data.toolId === 'string' && typeof data.toolName === 'string'
}

function handleToolCallArtifact(
  session: ActiveA2ASession,
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const dataPart = artifact.parts.find(isDataPart)
  if (!dataPart || !isToolCallData(dataPart.data)) {
    return []
  }

  const { toolId, toolName, inputs } = dataPart.data
  const args =
    typeof inputs === 'string' ? inputs : JSON.stringify(inputs ?? {})

  session.unmatchedToolCalls.push({ toolId, toolName })
  session.tryMatchToolRequests()

  return [
    {
      type: 'tool-call',
      toolCallId: toolId,
      toolName,
      input: args,
    },
  ]
}

function extractUsage(artifact: A2AArtifact) {
  const usage = artifact.metadata?.['agent-traceability']?.usage
  return {
    inputTokens: usage?.InputTokens,
    outputTokens: usage?.OutputTokens,
    totalTokens:
      usage?.InputTokens !== undefined && usage?.OutputTokens !== undefined
        ? usage.InputTokens + usage.OutputTokens
        : undefined,
  }
}

function handleStepComplete(
  session: ActiveA2ASession,
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const dataPart = artifact.parts.find(isDataPart)
  const stopReason = dataPart?.data?.stopReason
  const usage = extractUsage(artifact)

  // Only emit finish for non-tool-use steps. Tool-use finishes are handled
  // by the readyToFinishForTools flag set in tryMatchToolRequests.
  if (stopReason !== 'tool_use') {
    return [{ type: 'finish', finishReason: 'stop', usage }]
  }

  // Gate readyToFinishForTools so the stream won't close before all tool calls arrive.
  session.allToolCallsReceived = true
  session.tryMatchToolRequests()

  return []
}

function handleMessageArtifact(
  session: ActiveA2ASession,
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  // If we were token-streaming this message, just close the open text block
  // instead of emitting the full text again (the server sends both).
  if (session.activeStreamArtifactId) {
    const parts = closeActiveContentBlock(session)
    session.activeStreamArtifactId = undefined
    session.activeStreamContentType = undefined
    return parts
  }

  const parts: LanguageModelV2StreamPart[] = []
  const id = artifact.artifactId

  for (const part of artifact.parts) {
    if (part.kind === 'text') {
      parts.push({ type: 'text-start', id })
      parts.push({ type: 'text-delta', id, delta: part.text })
      parts.push({ type: 'text-end', id })
    }
  }

  return parts
}

function handleTokenStreamArtifact(
  session: ActiveA2ASession,
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const id = artifact.artifactId

  switch (artifact.name) {
    case ARTIFACT_NAME.MESSAGE_STREAM_START:
      session.activeStreamArtifactId = id
      session.activeStreamContentType = undefined
      return []
    case ARTIFACT_NAME.MESSAGE_CONTENT_DELTA:
      return handleContentDelta(session, artifact)
    case ARTIFACT_NAME.MESSAGE_STREAM_COMPLETE: {
      const parts = closeActiveContentBlock(session)
      session.activeStreamArtifactId = undefined
      session.activeStreamContentType = undefined
      return parts
    }
    default:
      return []
  }
}

function handleContentDelta(
  session: ActiveA2ASession,
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const streamId = session.activeStreamArtifactId ?? artifact.artifactId
  const parts: LanguageModelV2StreamPart[] = []

  for (const part of artifact.parts) {
    if (!isDataPart(part) || typeof part.data.delta !== 'string') {
      continue
    }

    const contentType =
      part.data.contentType === 'thinking' ? 'reasoning' : 'text'

    // Emit start/end events when content type changes (e.g. reasoning -> text)
    if (session.activeStreamContentType !== contentType) {
      parts.push(...closeActiveContentBlock(session))
      session.activeStreamContentType = contentType
      parts.push(
        contentType === 'reasoning'
          ? { type: 'reasoning-start', id: streamId }
          : { type: 'text-start', id: streamId }
      )
    }

    parts.push(
      contentType === 'reasoning'
        ? { type: 'reasoning-delta', id: streamId, delta: part.data.delta }
        : { type: 'text-delta', id: streamId, delta: part.data.delta }
    )
  }

  return parts
}

function closeActiveContentBlock(
  session: ActiveA2ASession
): LanguageModelV2StreamPart[] {
  const streamId = session.activeStreamArtifactId
  if (!streamId || !session.activeStreamContentType) {
    return []
  }

  const type =
    session.activeStreamContentType === 'reasoning'
      ? 'reasoning-end'
      : 'text-end'

  return [{ type, id: streamId }]
}
