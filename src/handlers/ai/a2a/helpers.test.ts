import type { LanguageModelV2CallOptions } from '@ai-sdk/provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildA2ARequest,
  extractChatId,
  extractLatestUserText,
  extractToolResults,
} from './helpers'

beforeEach(() => {
  vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' })
})

describe('extractChatId', () => {
  it('extracts chatId from provider options', () => {
    const options = {
      providerOptions: { grafanaAssistant: { chatId: 'abc123' } },
      prompt: [],
    } as unknown as LanguageModelV2CallOptions

    expect(extractChatId(options)).toBe('abc123')
  })

  it('throws when chatId is missing', () => {
    const options = {
      providerOptions: {},
      prompt: [],
    } as unknown as LanguageModelV2CallOptions

    expect(() => extractChatId(options)).toThrow(
      'requires providerOptions.grafanaAssistant.chatId'
    )
  })
})

describe('extractLatestUserText', () => {
  it('extracts text from a single user message', () => {
    const prompt: LanguageModelV2CallOptions['prompt'] = [
      { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
    ]

    expect(extractLatestUserText(prompt)).toBe('Hello')
  })

  it('returns the last user message when multiple exist', () => {
    const prompt: LanguageModelV2CallOptions['prompt'] = [
      { role: 'user', content: [{ type: 'text', text: 'First' }] },
      { role: 'assistant', content: [{ type: 'text', text: 'Reply' }] },
      { role: 'user', content: [{ type: 'text', text: 'Second' }] },
    ]

    expect(extractLatestUserText(prompt)).toBe('Second')
  })

  it('returns empty string when no user messages exist', () => {
    const prompt: LanguageModelV2CallOptions['prompt'] = [
      { role: 'system', content: 'System prompt' },
    ]

    expect(extractLatestUserText(prompt)).toBe('')
  })

  it('joins multiple text parts with newline', () => {
    const prompt: LanguageModelV2CallOptions['prompt'] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Part 1' },
          { type: 'text', text: 'Part 2' },
        ],
      },
    ]

    expect(extractLatestUserText(prompt)).toBe('Part 1\nPart 2')
  })
})

describe('extractToolResults', () => {
  it('extracts tool results from the last tool message', () => {
    const prompt: LanguageModelV2CallOptions['prompt'] = [
      { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'call-1',
            toolName: 'searchRequests',
            output: { type: 'json', value: [{ id: 'r1' }] },
          },
        ],
      },
    ]

    const results = extractToolResults(prompt)

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      toolCallId: 'call-1',
      toolName: 'searchRequests',
      output: [{ id: 'r1' }],
    })
  })

  it('returns empty when the last message is not a tool message', () => {
    const prompt: LanguageModelV2CallOptions['prompt'] = [
      { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
    ]

    expect(extractToolResults(prompt)).toHaveLength(0)
  })

  it('extracts multiple tool results', () => {
    const prompt: LanguageModelV2CallOptions['prompt'] = [
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'call-1',
            toolName: 'tool1',
            output: { type: 'json', value: 'a' },
          },
          {
            type: 'tool-result',
            toolCallId: 'call-2',
            toolName: 'tool2',
            output: { type: 'json', value: 'b' },
          },
        ],
      },
    ]

    const results = extractToolResults(prompt)
    expect(results).toHaveLength(2)
  })
})

describe('buildA2ARequest', () => {
  it('builds request without contextId', () => {
    const req = buildA2ARequest('Hello')

    expect(req).toEqual({
      jsonrpc: '2.0',
      id: 'test-uuid',
      method: 'message/stream',
      params: {
        message: {
          kind: 'message',
          role: 'user',
          messageId: 'test-uuid',
          parts: [{ kind: 'text', text: 'Hello' }],
        },
      },
    })
  })

  it('includes contextId when provided', () => {
    const req = buildA2ARequest('Hello', 'ctx-1')
    const params = req.params as Record<string, unknown>

    expect(params.contextId).toBe('ctx-1')
  })
})
