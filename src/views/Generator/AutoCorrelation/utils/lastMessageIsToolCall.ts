import { isToolOrDynamicToolUIPart } from 'ai'

import { Message } from '../types'

// Modified version of https://github.com/vercel/ai/blob/eb55677dd6fe7ced7dcd39640106e39f75faf089/packages/ai/src/ui/last-assistant-message-is-complete-with-tool-calls.ts
// Checks if last assistant message is complete with tool calls,
// but exclude the "finish" tool to prevent auto-sending after completion
export function lastMessageIsToolCall({
  messages,
}: {
  messages: Message[]
}): boolean {
  const message = messages[messages.length - 1]
  if (!message) {
    return false
  }
  if (message.role !== 'assistant') {
    return false
  }

  // Find the last step start index
  const lastStepStartIndex = message.parts.reduce((lastIndex, part, index) => {
    return part.type === 'step-start' ? index : lastIndex
  }, -1)

  // Get tool invocations from the last step
  const lastStepToolInvocations = message.parts
    .slice(lastStepStartIndex + 1)
    .filter(isToolOrDynamicToolUIPart)

  // Check if all tool calls are complete
  const allToolCallsComplete =
    lastStepToolInvocations.length > 0 &&
    lastStepToolInvocations.every((part) => part.state === 'output-available')

  if (!allToolCallsComplete) {
    return false
  }

  // Check if the last tool call was the "finish" tool
  const lastToolCall =
    lastStepToolInvocations[lastStepToolInvocations.length - 1]
  if (lastToolCall && lastToolCall.type === 'tool-finish') {
    return false // Don't auto-send after finish tool
  }

  return true
}
