export const LOG_PREFIX = '[GrafanaAssistant]'

export const NO_USAGE = {
  inputTokens: undefined,
  outputTokens: undefined,
  totalTokens: undefined,
} as const

/** A2A artifact name constants used in SSE events */
export const ARTIFACT_NAME = {
  STEP_TOOL_CALL: 'step.toolCall',
  STEP_COMPLETE: 'step.complete',
  STEP_MESSAGE: 'step.message',
  STEP_TOOL_RESULT: 'step.toolResult',
  MESSAGE_STREAM_START: 'message.stream.start',
  MESSAGE_CONTENT_DELTA: 'message.content.delta',
  MESSAGE_STREAM_COMPLETE: 'message.stream.complete',
} as const
