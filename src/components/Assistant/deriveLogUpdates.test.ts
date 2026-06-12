import { describe, expect, it } from 'vitest'

import type { Message } from '@/views/Generator/AutoCorrelation/types'

import { deriveLogUpdates } from './deriveLogUpdates'

type Parts = Message['parts']
type Part = Parts[number]

function assistantMessage(parts: Partial<Part>[], id = '1'): Message {
  return { role: 'assistant', id, parts } as Message
}

describe('deriveLogUpdates', () => {
  it('returns empty added/updated for empty messages array', () => {
    const result = deriveLogUpdates([], new Map())
    expect(result).toEqual({ added: [], updated: [] })
  })

  it('skips non-assistant messages', () => {
    const messages = [
      { role: 'user', id: 'u1', parts: [{ type: 'text', text: 'hello' }] },
    ] as Message[]

    const result = deriveLogUpdates(messages, new Map())
    expect(result).toEqual({ added: [], updated: [] })
  })

  it('skips tool and step parts', () => {
    const message = assistantMessage([
      { type: 'tool-runValidation' as Part['type'], toolCallId: 'tc-1' },
      { type: 'step-start' },
    ])

    const result = deriveLogUpdates([message], new Map())
    expect(result).toEqual({ added: [], updated: [] })
  })

  it('skips text parts with only whitespace', () => {
    const message = assistantMessage([
      { type: 'text', text: '   ' },
      { type: 'text', text: '\n\t' },
    ])

    const result = deriveLogUpdates([message], new Map())
    expect(result).toEqual({ added: [], updated: [] })
  })

  it('adds new text parts when partKey is not in seen map', () => {
    const message = assistantMessage([
      { type: 'text', text: 'Analyzing request' },
      { type: 'text', text: 'Found correlation' },
    ])

    const result = deriveLogUpdates([message], new Map())
    expect(result).toEqual({
      added: [
        { partKey: '1-0', text: 'Analyzing request', kind: 'text' },
        { partKey: '1-1', text: 'Found correlation', kind: 'text' },
      ],
      updated: [],
    })
  })

  it('adds reasoning parts as thinking entries', () => {
    const message = assistantMessage([
      { type: 'reasoning', text: 'Looking at the hosts' },
      { type: 'text', text: 'Found the API host' },
    ])

    const result = deriveLogUpdates([message], new Map())
    expect(result.added).toEqual([
      { partKey: '1-0', text: 'Looking at the hosts', kind: 'thinking' },
      { partKey: '1-1', text: 'Found the API host', kind: 'text' },
    ])
  })

  it('updates known parts when partKey is in seen map', () => {
    const message = assistantMessage([
      { type: 'reasoning', text: 'Updated thought' },
    ])
    const seen = new Map([['1-0', 'log-entry-42']])

    const result = deriveLogUpdates([message], seen)
    expect(result).toEqual({
      added: [],
      updated: [{ entryId: 'log-entry-42', text: 'Updated thought' }],
    })
  })

  it('categorizes mixed new and known parts correctly', () => {
    const message = assistantMessage([
      { type: 'text', text: 'Known part' },
      { type: 'step-start' },
      { type: 'text', text: 'New part' },
    ])
    const seen = new Map([['1-0', 'log-entry-1']])

    const result = deriveLogUpdates([message], seen)
    expect(result).toEqual({
      added: [{ partKey: '1-2', text: 'New part', kind: 'text' }],
      updated: [{ entryId: 'log-entry-1', text: 'Known part' }],
    })
  })

  it('uses message.id in partKey for multiple messages', () => {
    const messages = [
      assistantMessage([{ type: 'text', text: 'First message part' }], 'msg-a'),
      assistantMessage(
        [{ type: 'text', text: 'Second message part' }],
        'msg-b'
      ),
    ]

    const result = deriveLogUpdates(messages, new Map())
    expect(result.added.map((addition) => addition.partKey)).toEqual([
      'msg-a-0',
      'msg-b-0',
    ])
  })
})
