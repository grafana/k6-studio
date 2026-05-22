import { lastAssistantMessageIsCompleteWithToolCalls, UIMessage } from 'ai'

export function createTerminalToolGuard(terminalTool: string) {
  let servedToolCallId: string | null = null

  function guard(params: { messages: UIMessage[] }): boolean {
    if (!lastAssistantMessageIsCompleteWithToolCalls(params)) return false

    const lastMessage = params.messages.at(-1)
    if (lastMessage?.role === 'assistant') {
      const terminalPart = lastMessage.parts.findLast(
        (part) =>
          part.type === `tool-${terminalTool}` &&
          'state' in part &&
          part.state === 'output-available'
      )
      if (terminalPart && 'toolCallId' in terminalPart) {
        if (servedToolCallId === terminalPart.toolCallId) return false
        servedToolCallId = terminalPart.toolCallId
      }
    }

    return true
  }

  function reset() {
    servedToolCallId = null
  }

  return { guard, reset }
}
