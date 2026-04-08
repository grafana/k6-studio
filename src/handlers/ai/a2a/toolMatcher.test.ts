import { describe, expect, it } from 'vitest'

import { createA2ASession } from '@/test/factories/a2aSession'

import { handleRemoteToolRequest, tryMatchToolRequests } from './toolMatcher'
import type { A2ARemoteToolRequestEvent } from './types'

describe('tryMatchToolRequests', () => {
  it('matches tool call with remote request by toolName', () => {
    const session = createA2ASession({
      unmatchedToolCalls: [{ toolId: 'tool-1', toolName: 'searchRequests' }],
      unmatchedRemoteRequests: [
        { requestId: 'req-1', chatId: 'chat-1', toolName: 'searchRequests' },
      ],
    })

    tryMatchToolRequests(session)

    expect(session.pendingToolRequests.get('tool-1')).toEqual({
      requestId: 'req-1',
      chatId: 'chat-1',
    })
    expect(session.unmatchedToolCalls).toHaveLength(0)
    expect(session.unmatchedRemoteRequests).toHaveLength(0)
    expect(session.readyToFinishForTools).toBe(true)
  })

  it('sets readyToFinishForTools when all calls are matched', () => {
    const session = createA2ASession({
      unmatchedToolCalls: [{ toolId: 'tool-1', toolName: 'addRuleRegex' }],
      unmatchedRemoteRequests: [
        { requestId: 'req-1', chatId: 'chat-1', toolName: 'addRuleRegex' },
      ],
    })

    tryMatchToolRequests(session)

    expect(session.readyToFinishForTools).toBe(true)
  })

  it('does not set readyToFinishForTools when unmatched calls remain', () => {
    const session = createA2ASession({
      unmatchedToolCalls: [
        { toolId: 'tool-1', toolName: 'searchRequests' },
        { toolId: 'tool-2', toolName: 'getDetails' },
      ],
      unmatchedRemoteRequests: [
        { requestId: 'req-1', chatId: 'chat-1', toolName: 'searchRequests' },
      ],
    })

    tryMatchToolRequests(session)

    expect(session.pendingToolRequests.size).toBe(1)
    expect(session.unmatchedToolCalls).toHaveLength(1)
    expect(session.readyToFinishForTools).toBe(false)
  })

  it('leaves unmatched entries in queues when names differ', () => {
    const session = createA2ASession({
      unmatchedToolCalls: [{ toolId: 'tool-1', toolName: 'toolA' }],
      unmatchedRemoteRequests: [
        { requestId: 'req-1', chatId: 'chat-1', toolName: 'toolB' },
      ],
    })

    tryMatchToolRequests(session)

    expect(session.pendingToolRequests.size).toBe(0)
    expect(session.unmatchedToolCalls).toHaveLength(1)
    expect(session.unmatchedRemoteRequests).toHaveLength(1)
  })
})

describe('handleRemoteToolRequest', () => {
  it('queues the remote request and attempts matching', () => {
    const session = createA2ASession({
      unmatchedToolCalls: [
        { toolId: 'tool-1', toolName: 'getRequestsMetadata' },
      ],
    })

    const event: A2ARemoteToolRequestEvent = {
      type: 'REMOTE_TOOL_REQUEST',
      data: {
        requestId: 'req-1',
        chatId: 'chat-1',
        toolName: 'getRequestsMetadata',
        toolInput: {},
      },
    }

    handleRemoteToolRequest(session, event)

    expect(session.pendingToolRequests.get('tool-1')).toEqual({
      requestId: 'req-1',
      chatId: 'chat-1',
    })
    expect(session.readyToFinishForTools).toBe(true)
  })

  it('queues without matching when no tool call exists yet', () => {
    const session = createA2ASession()

    const event: A2ARemoteToolRequestEvent = {
      type: 'REMOTE_TOOL_REQUEST',
      data: {
        requestId: 'req-1',
        chatId: 'chat-1',
        toolName: 'searchRequests',
        toolInput: {},
      },
    }

    handleRemoteToolRequest(session, event)

    expect(session.pendingToolRequests.size).toBe(0)
    expect(session.unmatchedRemoteRequests).toHaveLength(1)
    expect(session.readyToFinishForTools).toBe(false)
  })
})
