import log from 'electron-log/main'

import type { A2ASessionConfig } from './config'
import { LOG_PREFIX } from './constants'
import type { A2ARemoteToolRequestEvent, A2ASSEEvent } from './types'

export interface PendingToolRequest {
  requestId: string
  chatId: string
}

export class ActiveA2ASession {
  reader: ReadableStreamDefaultReader<Uint8Array>
  contextId: string | undefined
  taskId: string | undefined
  sessionAbortController: AbortController
  config: A2ASessionConfig

  /** Maps toolId (from step.toolCall) to remote tool request info */
  pendingToolRequests = new Map<string, PendingToolRequest>()
  /** Queue of tool calls that haven't been matched to a REMOTE_TOOL_REQUEST yet */
  unmatchedToolCalls: Array<{ toolId: string; toolName: string }> = []
  /** Queue of remote requests that haven't been matched to a step.toolCall yet */
  unmatchedRemoteRequests: Array<{
    requestId: string
    chatId: string
    toolName: string
  }> = []
  /** Leftover bytes from SSE parsing between reads */
  sseBuffer = ''
  /** Set to true when step.complete(tool_use) signals all tool calls for this step are emitted */
  allToolCallsReceived = false
  /** Set to true when allToolCallsReceived AND all tool calls matched with REMOTE_TOOL_REQUESTs */
  readyToFinishForTools = false
  /** Artifact ID of the active token-streaming block (set by message.stream.start) */
  activeStreamArtifactId: string | undefined
  /** Content type of the currently open streaming block ('text' | 'reasoning') */
  activeStreamContentType: 'text' | 'reasoning' | undefined

  constructor(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    contextId: string | undefined,
    sessionAbortController: AbortController,
    config: A2ASessionConfig
  ) {
    this.reader = reader
    this.contextId = contextId
    this.sessionAbortController = sessionAbortController
    this.config = config
  }

  /**
   * Extracts complete SSE events from the session's buffer.
   * Incomplete events (no trailing blank line) remain in the buffer for the next read.
   */
  extractSSEEvents(): A2ASSEEvent[] {
    const events: A2ASSEEvent[] = []
    const lines = this.sseBuffer.split('\n')
    let dataLines: string[] = []
    let lastCompleteIndex = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? ''

      if (line.trim() === '') {
        if (dataLines.length > 0) {
          try {
            const parsed = JSON.parse(dataLines.join('\n')) as A2ASSEEvent
            events.push(parsed)
          } catch {
            log.warn(
              LOG_PREFIX,
              'Skipping malformed SSE event:',
              dataLines.join('\n')
            )
          }
        }
        dataLines = []
        lastCompleteIndex = i
        continue
      }

      if (line.startsWith('data: ')) {
        dataLines.push(line.slice(6))
      }
    }

    this.sseBuffer =
      lastCompleteIndex >= 0
        ? lines.slice(lastCompleteIndex + 1).join('\n')
        : this.sseBuffer

    return events
  }

  handleRemoteToolRequest(event: A2ARemoteToolRequestEvent): void {
    const { requestId, chatId, toolName } = event.data
    this.unmatchedRemoteRequests.push({ requestId, chatId, toolName })
    this.tryMatchToolRequests()
  }

  /**
   * Match unmatched tool calls with unmatched remote requests by toolName.
   * Since parallel tool calls are disabled, they arrive in order.
   *
   * When ALL unmatched tool calls have been matched, sets `readyToFinishForTools`
   * so the stream emits `finish(tool-calls)` — the A2A server is now blocking
   * and waiting for our remote tool response.
   */
  tryMatchToolRequests(): void {
    const remainingRequests = [...this.unmatchedRemoteRequests]
    const unmatchedCalls: typeof this.unmatchedToolCalls = []

    for (const call of this.unmatchedToolCalls) {
      const reqIndex = remainingRequests.findIndex(
        (r) => r.toolName === call.toolName
      )

      if (reqIndex === -1) {
        unmatchedCalls.push(call)
        continue
      }

      const req = remainingRequests.splice(reqIndex, 1)[0]!
      this.pendingToolRequests.set(call.toolId, {
        requestId: req.requestId,
        chatId: req.chatId,
      })
      log.info(
        LOG_PREFIX,
        `Matched: toolId=${call.toolId} ↔ requestId=${req.requestId} (${call.toolName})`
      )
    }

    this.unmatchedToolCalls = unmatchedCalls
    this.unmatchedRemoteRequests = remainingRequests

    this.readyToFinishForTools =
      this.allToolCallsReceived &&
      unmatchedCalls.length === 0 &&
      this.pendingToolRequests.size > 0
  }
}
