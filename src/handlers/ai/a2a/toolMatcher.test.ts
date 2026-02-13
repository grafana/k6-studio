import { describe, expect, it, vi } from 'vitest'

import { handleRemoteToolRequest, tryMatchToolRequests } from './toolMatcher'
import type { A2ARemoteToolRequestEvent, ActiveA2ASession } from './types'

vi.mock('electron-log/main', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

function createSession(
  overrides?: Partial<ActiveA2ASession>
): ActiveA2ASession {
  return {
    reader: undefined as unknown as ReadableStreamDefaultReader<Uint8Array>,
    contextId: undefined,
    taskId: undefined,
    sessionAbortController: new AbortController(),
    pendingToolRequests: new Map(),
    unmatchedToolCalls: [],
    unmatchedRemoteRequests: [],
    sseBuffer: '',
    readyToFinishForTools: false,
    ...overrides,
  }
}

describe('tryMatchToolRequests', () => {
  it('matches tool call with remote request by toolName', () => {
    const session = createSession({
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
    const session = createSession({
      unmatchedToolCalls: [{ toolId: 'tool-1', toolName: 'addRule' }],
      unmatchedRemoteRequests: [
        { requestId: 'req-1', chatId: 'chat-1', toolName: 'addRule' },
      ],
    })

    tryMatchToolRequests(session)

    expect(session.readyToFinishForTools).toBe(true)
  })

  it('does not set readyToFinishForTools when unmatched calls remain', () => {
    const session = createSession({
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
    const session = createSession({
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
    const session = createSession({
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
    const session = createSession()

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
