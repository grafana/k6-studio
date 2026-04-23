import { DynamicToolUIPart, isToolOrDynamicToolUIPart, ToolUIPart } from 'ai'

import { AiProvider } from '@/types/features'

import { Message, Tools } from '../types'

type ToolPart = DynamicToolUIPart | ToolUIPart<Tools>

/**
 * Determines if the final message contains completed tool invocations
 * that should trigger an automatic follow-up request.
 *
 * For OpenAI, returns false when the only completed tool is `finish`
 * to prevent an infinite loop (toolChoice: 'required' would force
 * another tool call). For A2A, always returns true so the finish
 * result is sent back via sendRemoteToolResponse.
 */
export function lastMessageIsToolCall(
  { messages }: { messages: Message[] },
  provider: AiProvider
) {
  const finalMessage = extractFinalMessage(messages)
  if (!finalMessage) {
    return false
  }

  const toolsInLastStep = extractToolsFromMostRecentStep(finalMessage.parts)

  if (!hasCompletedTools(toolsInLastStep)) {
    return false
  }

  if (provider === 'openai' && everyToolIsFinish(toolsInLastStep)) {
    return false
  }

  return true
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

function everyToolIsFinish(toolParts: ToolPart[]) {
  return toolParts.every((tool) => tool.type === 'tool-finish')
}
