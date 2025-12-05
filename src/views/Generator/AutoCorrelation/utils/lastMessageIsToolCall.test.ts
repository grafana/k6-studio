import { describe, expect, it } from 'vitest'

import type { Message } from '../types'

import { lastMessageIsToolCall } from './lastMessageIsToolCall'

type MessageParts = Message['parts']
type MessagePart = MessageParts[number]

function createAssistantMessage(parts: Partial<MessagePart>[]): Message {
  return { role: 'assistant', id: '1', parts } as Message
}

function createUserMessage(parts: MessageParts): Message {
  return { role: 'user', id: '1', parts }
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
        { type: 'text', text: 'some content' },
      ]),
    ]
    const result = lastMessageIsToolCall({ messages })
    expect(result).toBe(false)
  })

  it('returns false when not all tool calls are complete', () => {
    const messages = [
      createAssistantMessage([
        { type: 'step-start' },
        { type: 'tool-addRule', state: 'input-available' },
        { type: 'tool-runValidation', state: 'output-available' },
      ]),
    ]
    const result = lastMessageIsToolCall({ messages })
    expect(result).toBe(false)
  })

  it('returns false when the last tool call is the finish tool', () => {
    const messages = [
      createAssistantMessage([
        { type: 'step-start' },
        { type: 'tool-runValidation', state: 'output-available' },
        { type: 'tool-finish', state: 'output-available' },
      ]),
    ]
    const result = lastMessageIsToolCall({ messages })
    expect(result).toBe(false)
  })

  it('returns true when all tool calls complete and last is not finish', () => {
    const messages = [
      createAssistantMessage([
        { type: 'step-start' },
        { type: 'tool-runValidation', state: 'output-available' },
        { type: 'tool-addRule', state: 'output-available' },
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
        { type: 'tool-runValidation', state: 'input-streaming' },
        // Second (last) step - complete tool calls
        { type: 'step-start' },
        { type: 'tool-runValidation', state: 'output-available' },
        { type: 'tool-addRule', state: 'output-available' },
      ]),
    ]
    const result = lastMessageIsToolCall({ messages })
    expect(result).toBe(true)
  })

  it('returns true when last tool call was not successful', () => {
    const messages = [
      createAssistantMessage([
        { type: 'step-start' },
        { type: 'tool-runValidation', state: 'output-available' },
        { type: 'tool-addRule', state: 'output-error' },
      ]),
    ]
    const result = lastMessageIsToolCall({ messages })
    expect(result).toBe(true)
  })
})
