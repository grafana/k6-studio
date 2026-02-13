import type { LanguageModelV2StreamPart } from '@ai-sdk/provider'
import log from 'electron-log/main'

import { handleRemoteToolRequest, tryMatchToolRequests } from './toolMatcher'
import type {
  A2AArtifact,
  A2AArtifactUpdateEvent,
  A2ARemoteToolRequestEvent,
  A2ASSEEvent,
  A2ASSEResult,
  A2AStatusUpdateEvent,
  A2AStepCompleteData,
  A2AToolCallData,
  ActiveA2ASession,
} from './types'

const PREFIX = '[GrafanaAssistant]'

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
    log.error(PREFIX, `A2A error (${event.error.code}):`, event.error.message)
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
    handleRemoteToolRequest(session, result)
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

function handleStatusUpdate(
  session: ActiveA2ASession,
  event: A2AStatusUpdateEvent
): LanguageModelV2StreamPart[] {
  session.taskId = event.taskId
  session.contextId = event.contextId

  const state = event.status.state

  if (state === 'completed') {
    return [
      {
        type: 'finish',
        finishReason: 'stop',
        usage: {
          inputTokens: undefined,
          outputTokens: undefined,
          totalTokens: undefined,
        },
      },
    ]
  }

  if (state === 'failed' || state === 'canceled') {
    const statusMessage = event.status.message?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join(' ')

    const errorMessage =
      statusMessage || `A2A task ${state} (taskId=${event.taskId})`

    log.error(PREFIX, `Task ${state}:`, errorMessage)
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
    case 'step.toolCall':
      return handleToolCallArtifact(session, artifact)
    case 'step.complete':
      return handleStepComplete(artifact)
    case 'step.message':
      return handleMessageArtifact(artifact)
    case 'message.stream.start':
    case 'message.content.delta':
    case 'message.stream.complete':
      return handleTokenStreamArtifact(artifact)
    case 'step.toolResult':
      return []
    default:
      return []
  }
}

function handleToolCallArtifact(
  session: ActiveA2ASession,
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const dataPart = artifact.parts.find((p) => p.kind === 'data' && p.data)
  if (!dataPart?.data) {
    return []
  }

  const data = dataPart.data as unknown as A2AToolCallData
  const toolId = data.toolId
  const toolName = data.toolName
  const args =
    typeof data.inputs === 'string'
      ? data.inputs
      : JSON.stringify(data.inputs ?? {})

  session.unmatchedToolCalls.push({ toolId, toolName })
  tryMatchToolRequests(session)

  return [
    {
      type: 'tool-call' as const,
      toolCallId: toolId,
      toolName,
      input: args,
    },
  ]
}

function handleStepComplete(
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const dataPart = artifact.parts.find((p) => p.kind === 'data' && p.data)
  const data = dataPart?.data as A2AStepCompleteData | undefined

  // Only emit finish for non-tool-use steps. Tool-use finishes are handled
  // by the readyToFinishForTools flag set in tryMatchToolRequests.
  if (data?.stopReason !== 'tool_use') {
    return [
      {
        type: 'finish' as const,
        finishReason: 'stop' as const,
        usage: {
          inputTokens: undefined,
          outputTokens: undefined,
          totalTokens: undefined,
        },
      },
    ]
  }

  return []
}

function handleMessageArtifact(
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const parts: LanguageModelV2StreamPart[] = []
  const id = artifact.artifactId

  for (const part of artifact.parts) {
    if (part.kind === 'text' && part.text) {
      parts.push({ type: 'text-start', id })
      parts.push({ type: 'text-delta', id, delta: part.text })
      parts.push({ type: 'text-end', id })
    }
  }

  return parts
}

function handleTokenStreamArtifact(
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const parts: LanguageModelV2StreamPart[] = []
  const id = artifact.artifactId

  if (artifact.name === 'message.stream.start') {
    parts.push({ type: 'text-start', id })
  }

  if (artifact.name === 'message.content.delta') {
    for (const part of artifact.parts) {
      if (part.kind === 'text' && part.text) {
        parts.push({ type: 'text-delta', id, delta: part.text })
      }
    }
  }

  if (artifact.name === 'message.stream.complete') {
    parts.push({ type: 'text-end', id })
  }

  return parts
}
