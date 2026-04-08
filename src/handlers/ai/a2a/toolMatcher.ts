import log from 'electron-log/main'

import { LOG_PREFIX } from './constants'
import type { A2ARemoteToolRequestEvent, ActiveA2ASession } from './types'

export function handleRemoteToolRequest(
  session: ActiveA2ASession,
  event: A2ARemoteToolRequestEvent
): void {
  const { requestId, chatId, toolName } = event.data
  session.unmatchedRemoteRequests.push({ requestId, chatId, toolName })
  tryMatchToolRequests(session)
}

/**
 * Match unmatched tool calls with unmatched remote requests by toolName.
 * Since parallel tool calls are disabled, they arrive in order.
 *
 * When ALL unmatched tool calls have been matched, sets `readyToFinishForTools`
 * so the stream emits `finish(tool-calls)` — the A2A server is now blocking
 * and waiting for our remote tool response.
 */
export function tryMatchToolRequests(session: ActiveA2ASession): void {
  const remainingRequests = [...session.unmatchedRemoteRequests]
  const unmatchedCalls: typeof session.unmatchedToolCalls = []
  let matchCount = 0

  for (const call of session.unmatchedToolCalls) {
    const reqIndex = remainingRequests.findIndex(
      (r) => r.toolName === call.toolName
    )

    if (reqIndex === -1) {
      unmatchedCalls.push(call)
      continue
    }

    const req = remainingRequests.splice(reqIndex, 1)[0]!
    session.pendingToolRequests.set(call.toolId, {
      requestId: req.requestId,
      chatId: req.chatId,
    })
    log.info(
      LOG_PREFIX,
      `Matched: toolId=${call.toolId} ↔ requestId=${req.requestId} (${call.toolName})`
    )
    matchCount++
  }

  session.unmatchedToolCalls = unmatchedCalls
  session.unmatchedRemoteRequests = remainingRequests

  if (
    matchCount > 0 &&
    unmatchedCalls.length === 0 &&
    session.pendingToolRequests.size > 0
  ) {
    session.readyToFinishForTools = true
  }
}
