import log from 'electron-log/main'

import type { A2ARemoteToolRequestEvent, ActiveA2ASession } from './types'

const PREFIX = '[GrafanaAssistant]'

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
  const unmatchedCalls = session.unmatchedToolCalls
  const unmatchedRequests = session.unmatchedRemoteRequests

  let matchedAny = false
  let i = 0
  while (i < unmatchedCalls.length && unmatchedRequests.length > 0) {
    const call = unmatchedCalls[i]
    if (!call) break

    const reqIndex = unmatchedRequests.findIndex(
      (r) => r.toolName === call.toolName
    )

    if (reqIndex !== -1) {
      const req = unmatchedRequests[reqIndex]
      if (req) {
        session.pendingToolRequests.set(call.toolId, {
          requestId: req.requestId,
          chatId: req.chatId,
        })
        log.info(
          PREFIX,
          `Matched: toolId=${call.toolId} ↔ requestId=${req.requestId} (${call.toolName})`
        )
      }
      unmatchedRequests.splice(reqIndex, 1)
      unmatchedCalls.splice(i, 1)
      matchedAny = true
    } else {
      i++
    }
  }

  if (
    matchedAny &&
    unmatchedCalls.length === 0 &&
    session.pendingToolRequests.size > 0
  ) {
    session.readyToFinishForTools = true
  }
}
