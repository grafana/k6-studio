import { useChat } from '@ai-sdk/react'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGeneratorStore } from '@/store/generator'

import { useGenerateRules } from './useGenerateRules'

vi.mock('@ai-sdk/react', () => ({ useChat: vi.fn() }))

interface ToolCallArg {
  toolCall: {
    toolName: string
    toolCallId: string
    input: unknown
    dynamic: boolean
  }
}
type OnToolCall = (arg: ToolCallArg) => Promise<void> | void

let capturedOnToolCall: OnToolCall | undefined
const addToolOutput =
  vi.fn<(arg: { tool: string; toolCallId: string; output: unknown }) => void>()

beforeEach(() => {
  vi.clearAllMocks()
  capturedOnToolCall = undefined
  vi.stubGlobal('studio', { app: { trackEvent: vi.fn() } })
  useGeneratorStore.setState({ requests: [], allowlist: [] })

  vi.mocked(useChat).mockImplementation((options) => {
    capturedOnToolCall = (options as { onToolCall?: OnToolCall }).onToolCall
    return {
      sendMessage: vi.fn(),
      error: undefined,
      messages: [],
      addToolOutput,
      status: 'ready',
      stop: vi.fn(),
      clearError: vi.fn(),
      setMessages: vi.fn(),
    } as unknown as ReturnType<typeof useChat>
  })
})

describe('useGenerateRules onToolCall', () => {
  it('answers with an error output when a tool handler throws on malformed input', async () => {
    renderHook(() => useGenerateRules({ clearValidation: vi.fn() }))

    expect(capturedOnToolCall).toBeDefined()

    // getRequestDetails with no requestIds: the handler reads requestIds.length
    // and throws. A thrown handler must become a tool output the model can
    // retry, never an unanswered tool call that wedges the stream.
    await expect(
      capturedOnToolCall!({
        toolCall: {
          toolName: 'getRequestDetails',
          toolCallId: 't1',
          input: {},
          dynamic: false,
        },
      })
    ).resolves.toBeUndefined()

    expect(addToolOutput).toHaveBeenCalledTimes(1)
    const call = addToolOutput.mock.calls[0]?.[0]
    expect(call?.tool).toBe('getRequestDetails')
    expect(call?.toolCallId).toBe('t1')
    expect(call?.output).toHaveProperty('error')
  })
})
