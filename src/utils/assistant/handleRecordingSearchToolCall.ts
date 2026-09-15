import { StaticToolCall } from 'ai'

import { ActionLogEntry } from '@/components/Assistant/types'
import { ProxyData } from '@/types'

import {
  getRequestDetails,
  getRequestsMetadata,
  searchRequests,
} from './searchToolHandlers'
import { recordingSearchTools } from './tools'

export type RecordingSearchToolCall = StaticToolCall<
  typeof recordingSearchTools
>

type AddEntry = (entry: Omit<ActionLogEntry, 'id' | 'timestamp'>) => unknown

/**
 * Type guard narrowing a wizard tool call to the recording-search subset. The
 * three search tools share identical inputs across every toolset because they
 * all spread `recordingSearchTools`, so the union narrows the input precisely.
 */
export function isRecordingSearchToolCall(toolCall: {
  toolName: string
  input: unknown
}): toolCall is RecordingSearchToolCall {
  return (
    toolCall.toolName === 'searchRequests' ||
    toolCall.toolName === 'getRequestsMetadata' ||
    toolCall.toolName === 'getRequestDetails'
  )
}

/**
 * Runs a recording-search tool call shared by every wizard agent, logging the
 * action and returning the tool result.
 */
export function handleRecordingSearchToolCall(
  toolCall: RecordingSearchToolCall,
  requests: ProxyData[],
  addEntry: AddEntry
): unknown {
  switch (toolCall.toolName) {
    case 'searchRequests': {
      const { query, limit } = toolCall.input
      addEntry({ type: 'info', text: `Searching requests for "${query}"` })
      return searchRequests(requests, query, limit ?? 20)
    }

    case 'getRequestsMetadata': {
      const { startIndex, endIndex } = toolCall.input
      addEntry({ type: 'info', text: 'Reading request metadata' })
      return getRequestsMetadata(requests, startIndex ?? 0, endIndex)
    }

    case 'getRequestDetails': {
      const { requestIds, fields } = toolCall.input
      addEntry({
        type: 'info',
        text: `Inspecting ${requestIds.length} request${requestIds.length > 1 ? 's' : ''}`,
      })
      return getRequestDetails(requests, requestIds, fields)
    }
  }
}
