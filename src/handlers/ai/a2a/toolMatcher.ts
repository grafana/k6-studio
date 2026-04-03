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
  const { matched, remainingCalls, remainingRequests } =
    session.unmatchedToolCalls.reduce<{
      matched: Array<{
        call: (typeof session.unmatchedToolCalls)[number]
        req: (typeof session.unmatchedRemoteRequests)[number]
      }>
      remainingCalls: typeof session.unmatchedToolCalls
      remainingRequests: typeof session.unmatchedRemoteRequests
    }>(
      (acc, call) => {
        const reqIndex = acc.remainingRequests.findIndex(
          (r) => r.toolName === call.toolName
        )

        if (reqIndex !== -1) {
          const req = acc.remainingRequests[reqIndex]!
          acc.matched.push({ call, req })
          acc.remainingRequests = acc.remainingRequests.filter(
            (_, i) => i !== reqIndex
          )
        } else {
          acc.remainingCalls.push(call)
        }

        return acc
      },
      {
        matched: [],
        remainingCalls: [],
        remainingRequests: [...session.unmatchedRemoteRequests],
      }
    )

  matched.forEach(({ call, req }) => {
    session.pendingToolRequests.set(call.toolId, {
      requestId: req.requestId,
      chatId: req.chatId,
    })
    log.info(
      LOG_PREFIX,
      `Matched: toolId=${call.toolId} ↔ requestId=${req.requestId} (${call.toolName})`
    )
  })

  session.unmatchedToolCalls = remainingCalls
  session.unmatchedRemoteRequests = remainingRequests

  if (
    matched.length > 0 &&
    remainingCalls.length === 0 &&
    session.pendingToolRequests.size > 0
  ) {
    session.readyToFinishForTools = true
  }
}
