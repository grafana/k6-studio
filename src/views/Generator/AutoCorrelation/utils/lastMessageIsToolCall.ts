import { DynamicToolUIPart, isToolOrDynamicToolUIPart, ToolUIPart } from 'ai'

import { Message, Tools } from '../types'

type ToolPart = DynamicToolUIPart | ToolUIPart<Tools>

/**
 * Determines if the final message contains completed tool invocations
 * that should trigger an automatic follow-up request.
 */
export function lastMessageIsToolCall({ messages }: { messages: Message[] }) {
  const finalMessage = extractFinalMessage(messages)
  if (!finalMessage) {
    return false
  }

  const toolsInLastStep = extractToolsFromMostRecentStep(finalMessage.parts)

  return hasCompletedTools(toolsInLastStep)
}

function extractFinalMessage(messages: Message[]) {
  const lastEntry = messages.at(-1)

  if (!lastEntry || lastEntry.role !== 'assistant') {
    return null
  }

  return lastEntry
}

function extractToolsFromMostRecentStep(parts: Message['parts']): ToolPart[] {
  const mostRecentStepBoundary = findMostRecentStepBoundary(parts)
  const partsAfterLastStep = parts.slice(mostRecentStepBoundary + 1)

  return partsAfterLastStep.filter(isToolOrDynamicToolUIPart)
}

function findMostRecentStepBoundary(parts: Message['parts']) {
  return parts.findLastIndex((part) => part.type === 'step-start')
}

function hasCompletedTools(toolParts: ToolPart[]) {
  if (toolParts.length === 0) {
    return false
  }

  return toolParts.every(isToolComplete)
}

function isToolComplete(tool: ToolPart) {
  return tool.state === 'output-available' || tool.state === 'output-error'
}
