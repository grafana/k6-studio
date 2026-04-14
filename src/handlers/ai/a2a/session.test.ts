import { describe, expect, it } from 'vitest'

import { createA2ASession } from '@/test/factories/a2aSession'

import type { A2ARemoteToolRequestEvent } from './types'

describe('ActiveA2ASession', () => {
  describe('extractSSEEvents', () => {
    it('parses a single complete event', () => {
      const session = createA2ASession({
        sseBuffer:
          'data: {"jsonrpc":"2.0","id":1,"result":{"kind":"status-update","taskId":"t1","contextId":"c1","status":{"state":"working"}}}\n\n',
      })

      const events = session.extractSSEEvents()

      expect(events).toHaveLength(1)
      expect(events[0]?.jsonrpc).toBe('2.0')
      expect(session.sseBuffer).toBe('')
    })

    it('parses multiple events in one buffer', () => {
      const event1 =
        '{"jsonrpc":"2.0","id":1,"result":{"kind":"status-update","taskId":"t1","contextId":"c1","status":{"state":"working"}}}'
      const event2 =
        '{"jsonrpc":"2.0","id":2,"result":{"kind":"status-update","taskId":"t1","contextId":"c1","status":{"state":"completed"}}}'

      const session = createA2ASession({
        sseBuffer: `data: ${event1}\n\ndata: ${event2}\n\n`,
      })

      const events = session.extractSSEEvents()

      expect(events).toHaveLength(2)
    })

    it('keeps incomplete events in the buffer', () => {
      const session = createA2ASession({
        sseBuffer: 'data: {"jsonrpc":"2.0","id":1}',
      })

      const events = session.extractSSEEvents()

      expect(events).toHaveLength(0)
      expect(session.sseBuffer).toBe('data: {"jsonrpc":"2.0","id":1}')
    })

    it('joins multi-line data fields', () => {
      const session = createA2ASession({
        sseBuffer: 'data: {"jsonrpc":"2.0",\ndata: "id":1,"result":null}\n\n',
      })

      const events = session.extractSSEEvents()

      expect(events).toHaveLength(1)
      expect(events[0]?.id).toBe(1)
    })

    it('skips malformed JSON gracefully', () => {
      const session = createA2ASession({
        sseBuffer:
          'data: not-json\n\ndata: {"jsonrpc":"2.0","id":2,"result":null}\n\n',
      })

      const events = session.extractSSEEvents()

      expect(events).toHaveLength(1)
      expect(events[0]?.id).toBe(2)
    })

    it('returns empty array for empty buffer', () => {
      const session = createA2ASession({ sseBuffer: '' })
      const events = session.extractSSEEvents()
      expect(events).toHaveLength(0)
    })

    it('handles mixed complete and incomplete events', () => {
      const session = createA2ASession({
        sseBuffer:
          'data: {"jsonrpc":"2.0","id":1,"result":null}\n\ndata: {"incomplete',
      })

      const events = session.extractSSEEvents()

      expect(events).toHaveLength(1)
      expect(session.sseBuffer).toBe('data: {"incomplete')
    })
  })

  describe('tryMatchToolRequests', () => {
    it('matches tool call with remote request by toolName', () => {
      const session = createA2ASession({
        unmatchedToolCalls: [{ toolId: 'tool-1', toolName: 'searchRequests' }],
        unmatchedRemoteRequests: [
          { requestId: 'req-1', chatId: 'chat-1', toolName: 'searchRequests' },
        ],
      })

      session.tryMatchToolRequests()

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

      session.tryMatchToolRequests()

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

      session.tryMatchToolRequests()

      expect(session.pendingToolRequests.size).toBe(1)
      expect(session.unmatchedToolCalls).toHaveLength(1)
      expect(session.readyToFinishForTools).toBe(false)
    })

    it('matches multiple tool calls in a single pass', () => {
      const session = createA2ASession({
        unmatchedToolCalls: [
          { toolId: 'tool-1', toolName: 'searchRequests' },
          { toolId: 'tool-2', toolName: 'addRuleRegex' },
        ],
        unmatchedRemoteRequests: [
          { requestId: 'req-1', chatId: 'chat-1', toolName: 'searchRequests' },
          { requestId: 'req-2', chatId: 'chat-1', toolName: 'addRuleRegex' },
        ],
      })

      session.tryMatchToolRequests()

      expect(session.pendingToolRequests.size).toBe(2)
      expect(session.unmatchedToolCalls).toHaveLength(0)
      expect(session.unmatchedRemoteRequests).toHaveLength(0)
      expect(session.readyToFinishForTools).toBe(true)
    })

    it('matches duplicate toolName values in order', () => {
      const session = createA2ASession({
        unmatchedToolCalls: [
          { toolId: 'tool-1', toolName: 'searchRequests' },
          { toolId: 'tool-2', toolName: 'searchRequests' },
        ],
        unmatchedRemoteRequests: [
          { requestId: 'req-1', chatId: 'chat-1', toolName: 'searchRequests' },
          { requestId: 'req-2', chatId: 'chat-1', toolName: 'searchRequests' },
        ],
      })

      session.tryMatchToolRequests()

      expect(session.pendingToolRequests.get('tool-1')).toEqual({
        requestId: 'req-1',
        chatId: 'chat-1',
      })
      expect(session.pendingToolRequests.get('tool-2')).toEqual({
        requestId: 'req-2',
        chatId: 'chat-1',
      })
      expect(session.unmatchedToolCalls).toHaveLength(0)
      expect(session.readyToFinishForTools).toBe(true)
    })

    it('leaves unmatched entries in queues when names differ', () => {
      const session = createA2ASession({
        unmatchedToolCalls: [{ toolId: 'tool-1', toolName: 'toolA' }],
        unmatchedRemoteRequests: [
          { requestId: 'req-1', chatId: 'chat-1', toolName: 'toolB' },
        ],
      })

      session.tryMatchToolRequests()

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

      session.handleRemoteToolRequest(event)

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

      session.handleRemoteToolRequest(event)

      expect(session.pendingToolRequests.size).toBe(0)
      expect(session.unmatchedRemoteRequests).toHaveLength(1)
      expect(session.readyToFinishForTools).toBe(false)
    })
  })
})
