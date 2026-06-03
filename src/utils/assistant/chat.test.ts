import { UIMessage } from 'ai'
import { describe, expect, it } from 'vitest'

import { createTerminalToolGuard } from './chat'

type Parts = UIMessage['parts']
type Part = Parts[number]

function assistantMessage(parts: Partial<Part>[], id = '1'): UIMessage {
  return { role: 'assistant', id, parts } as UIMessage
}

describe('createTerminalToolGuard', () => {
  it('returns false when no completed tool calls exist', () => {
    const { guard } = createTerminalToolGuard('finish')
    expect(guard({ messages: [] })).toBe(false)
  })

  it('returns true for normal tool calls without terminal tool', () => {
    const { guard } = createTerminalToolGuard('finish')
    const messages = [
      assistantMessage([
        { type: 'step-start' },
        { type: 'tool-runValidation', state: 'output-available' },
      ]),
    ]
    expect(guard({ messages })).toBe(true)
  })

  it('returns true on first fire with terminal tool', () => {
    const { guard } = createTerminalToolGuard('finish')
    const messages = [
      assistantMessage([
        { type: 'step-start' },
        { type: 'tool-finish', toolCallId: 'tc-1', state: 'output-available' },
      ]),
    ]
    expect(guard({ messages })).toBe(true)
  })

  it('returns false on second fire with same terminal tool call ID', () => {
    const { guard } = createTerminalToolGuard('finish')
    const messages = [
      assistantMessage([
        { type: 'step-start' },
        { type: 'tool-finish', toolCallId: 'tc-1', state: 'output-available' },
      ]),
    ]
    guard({ messages })
    expect(guard({ messages })).toBe(false)
  })

  it('allows new terminal tool call ID after reset', () => {
    const { guard, reset } = createTerminalToolGuard('finish')
    const messages = [
      assistantMessage([
        { type: 'step-start' },
        { type: 'tool-finish', toolCallId: 'tc-1', state: 'output-available' },
      ]),
    ]
    guard({ messages })
    expect(guard({ messages })).toBe(false)

    reset()
    expect(guard({ messages })).toBe(true)
  })

  it('allows different terminal tool call IDs', () => {
    const { guard } = createTerminalToolGuard('finish')
    const firstMessages = [
      assistantMessage([
        { type: 'step-start' },
        { type: 'tool-finish', toolCallId: 'tc-1', state: 'output-available' },
      ]),
    ]
    const secondMessages = [
      assistantMessage([
        { type: 'step-start' },
        { type: 'tool-finish', toolCallId: 'tc-2', state: 'output-available' },
      ]),
    ]
    expect(guard({ messages: firstMessages })).toBe(true)
    expect(guard({ messages: secondMessages })).toBe(true)
  })
})
