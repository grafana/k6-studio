import { describe, expect, it } from 'vitest'

import type { Message } from '../types'

import { lastMessageIsToolCall } from './lastMessageIsToolCall'

function createAssistantMessage(parts: unknown[]): Message {
  return { role: 'assistant', parts } as unknown as Message
}

function createUserMessage(parts: unknown[]): Message {
  return { role: 'user', parts } as unknown as Message
}

describe('lastMessageIsToolCall', () => {
  it('returns false when there are no messages', () => {
    const result = lastMessageIsToolCall({
      messages: [] as unknown as Message[],
    })
    expect(result).toBe(false)
  })

  it('returns false when last message is not from assistant', () => {
    const messages = [createUserMessage([])]
    const result = lastMessageIsToolCall({ messages })
    expect(result).toBe(false)
  })

  it('returns false when there are no tool calls after the last step', () => {
    const messages = [
      createAssistantMessage([
        { type: 'step-start' },
        { type: 'text', content: 'some content' },
      ]),
    ]
    const result = lastMessageIsToolCall({ messages })
    expect(result).toBe(false)
  })

  it('returns false when not all tool calls are complete', () => {
    const messages = [
      createAssistantMessage([
        { type: 'step-start' },
        { type: 'tool-call', state: 'output-available', isTool: true },
        { type: 'tool-call', state: 'in-progress', isTool: true },
      ]),
    ]
    const result = lastMessageIsToolCall({ messages })
    expect(result).toBe(false)
  })

  it('returns false when the last tool call is the finish tool', () => {
    const messages = [
      createAssistantMessage([
        { type: 'step-start' },
        { type: 'tool-call', state: 'output-available', isTool: true },
        { type: 'tool-finish', state: 'output-available', isTool: true },
      ]),
    ]
    const result = lastMessageIsToolCall({ messages })
    expect(result).toBe(false)
  })

  it('returns true when all tool calls complete and last is not finish', () => {
    const messages = [
      createAssistantMessage([
        { type: 'step-start' },
        { type: 'tool-call', state: 'output-available', isTool: true },
        { type: 'tool-result', state: 'output-available', isTool: true },
      ]),
    ]
    const result = lastMessageIsToolCall({ messages })
    expect(result).toBe(true)
  })

  it('considers only the last step when determining completeness', () => {
    const messages = [
      createAssistantMessage([
        // First step - incomplete tool call
        { type: 'step-start' },
        { type: 'tool-call', state: 'in-progress', isTool: true },
        // Second (last) step - complete tool calls
        { type: 'step-start' },
        { type: 'tool-call', state: 'output-available', isTool: true },
        { type: 'tool-result', state: 'output-available', isTool: true },
      ]),
    ]
    const result = lastMessageIsToolCall({ messages })
    expect(result).toBe(true)
  })
})
