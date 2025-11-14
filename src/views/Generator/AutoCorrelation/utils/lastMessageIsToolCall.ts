import { DynamicToolUIPart, isToolOrDynamicToolUIPart, ToolUIPart } from 'ai'

import { Message, Tools } from '../types'

type ToolPart = DynamicToolUIPart | ToolUIPart<Tools>

/**
 * Determines if the final message contains completed tool invocations
 * (excluding finish tools which should not trigger auto-sending)
 */
export function lastMessageIsToolCall({ messages }: { messages: Message[] }) {
  const finalMessage = extractFinalMessage(messages)
  if (!finalMessage) {
    return false
  }

  const toolsInLastStep = extractToolsFromMostRecentStep(finalMessage.parts)

  return (
    hasCompletedTools(toolsInLastStep) && !endsWithFinishTool(toolsInLastStep)
  )
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

function findMostRecentStepBoundary(parts: unknown[]) {
  let boundaryPosition = -1

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i] as { type?: string }
    if (part.type === 'step-start') {
      boundaryPosition = i
    }
  }

  return boundaryPosition
}

function hasCompletedTools(toolParts: ToolPart[]) {
  if (toolParts.length === 0) {
    return false
  }

  return toolParts.every(isToolComplete)
}

function isToolComplete(tool: ToolPart) {
  return tool.state === 'output-available'
}

function endsWithFinishTool(toolParts: ToolPart[]) {
  const finalTool = toolParts.at(-1)
  return finalTool?.type === 'tool-finish'
}
