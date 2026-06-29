import { useChat } from '@ai-sdk/react'
import { act, renderHook } from '@testing-library/react'
import { tool } from 'ai'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { UsageEventName } from '@/services/usageTracking/types'

import { useAssistantAgent } from './useAssistantAgent'

vi.mock('@ai-sdk/react', () => ({ useChat: vi.fn() }))

const tools = {
  doWork: tool({
    description: 'Do some work',
    inputSchema: z.object({ value: z.string() }),
  }),
  finish: tool({
    description: 'Finish the run',
    inputSchema: z.object({ outcome: z.enum(['success', 'failure']) }),
  }),
}

const trackingEvents = {
  started: { event: UsageEventName.HostSelectionStarted },
  errored: { event: UsageEventName.HostSelectionErrored },
  aborted: { event: UsageEventName.HostSelectionAborted },
} as const

interface CapturedChatOptions {
  onToolCall?: (input: { toolCall: Record<string, unknown> }) => Promise<void>
  onError?: (error: Error) => void
}

describe('useAssistantAgent', () => {
  const trackEvent = vi.fn()
  const sendMessage = vi.fn()
  const addToolOutput = vi.fn()
  const stopGeneration = vi.fn()
  let capturedOptions: CapturedChatOptions = {}

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('studio', { app: { trackEvent } })
    vi.mocked(useChat).mockImplementation((options) => {
      capturedOptions = options as CapturedChatOptions

      return {
        sendMessage,
        error: undefined,
        messages: [],
        addToolOutput,
        status: 'ready',
        stop: stopGeneration,
        clearError: vi.fn(),
        setMessages: vi.fn(),
      } as unknown as ReturnType<typeof useChat>
    })
  })

  function renderAgent(onToolCall: (toolCall: unknown) => unknown = vi.fn()) {
    return renderHook(() =>
      useAssistantAgent({ tools, onToolCall, trackingEvents })
    )
  }

  it('starts in the not-started state', () => {
    const { result } = renderAgent()

    expect(result.current.status).toBe('not-started')
  })

  it('tracks and sends the initial message on start', () => {
    const { result } = renderAgent()

    act(() => {
      void result.current.start('prompt text')
    })

    expect(result.current.status).toBe('running')
    expect(trackEvent).toHaveBeenCalledWith(trackingEvents.started)
    expect(sendMessage).toHaveBeenCalledWith({ text: 'prompt text' })
  })

  it('executes tool calls and forwards their output', async () => {
    const onToolCall = vi.fn().mockReturnValue({ ok: true })
    renderAgent(onToolCall)

    await act(() =>
      capturedOptions.onToolCall!({
        toolCall: { toolName: 'doWork', toolCallId: 'call-1', input: {} },
      })
    )

    expect(onToolCall).toHaveBeenCalledWith(
      expect.objectContaining({ toolName: 'doWork', type: 'tool-call' })
    )
    expect(addToolOutput).toHaveBeenCalledWith({
      tool: 'doWork',
      toolCallId: 'call-1',
      output: { ok: true },
    })
  })

  it('returns an error output instead of throwing when a handler fails', async () => {
    const onToolCall = vi.fn().mockImplementation(() => {
      throw new Error('invalid parameter input')
    })
    renderAgent(onToolCall)

    await act(() =>
      capturedOptions.onToolCall!({
        toolCall: { toolName: 'doWork', toolCallId: 'call-1', input: {} },
      })
    )

    expect(addToolOutput).toHaveBeenCalledWith({
      tool: 'doWork',
      toolCallId: 'call-1',
      output: { error: 'invalid parameter input' },
    })
  })

  it('does not complete when the finish handler fails', async () => {
    const onToolCall = vi.fn().mockImplementation(() => {
      throw new Error('boom')
    })
    const { result } = renderAgent(onToolCall)

    act(() => {
      void result.current.start('prompt')
    })
    await act(() =>
      capturedOptions.onToolCall!({
        toolCall: {
          toolName: 'finish',
          toolCallId: 'call-2',
          input: { outcome: 'success' },
        },
      })
    )

    expect(result.current.status).toBe('running')
  })

  it('ignores dynamic tool calls', async () => {
    const onToolCall = vi.fn()
    renderAgent(onToolCall)

    await act(() =>
      capturedOptions.onToolCall!({
        toolCall: { toolName: 'doWork', toolCallId: 'call-1', dynamic: true },
      })
    )

    expect(onToolCall).not.toHaveBeenCalled()
    expect(addToolOutput).not.toHaveBeenCalled()
  })

  it('completes when the finish tool is called', async () => {
    const { result } = renderAgent()

    act(() => {
      void result.current.start('prompt')
    })
    await act(() =>
      capturedOptions.onToolCall!({
        toolCall: {
          toolName: 'finish',
          toolCallId: 'call-2',
          input: { outcome: 'success' },
        },
      })
    )

    expect(result.current.status).toBe('completed')
  })

  it('completes on a custom terminal tool', async () => {
    const { result } = renderHook(() =>
      useAssistantAgent({
        tools,
        terminalTool: 'doWork',
        onToolCall: vi.fn(),
        trackingEvents,
      })
    )

    act(() => {
      void result.current.start('prompt')
    })
    await act(() =>
      capturedOptions.onToolCall!({
        toolCall: { toolName: 'doWork', toolCallId: 'call-1', input: {} },
      })
    )

    expect(result.current.status).toBe('completed')
  })

  it('moves to the error state and tracks it on chat errors', () => {
    const { result } = renderAgent()

    act(() => {
      capturedOptions.onError!(new Error('boom'))
    })

    expect(result.current.status).toBe('error')
    expect(trackEvent).toHaveBeenCalledWith(trackingEvents.errored)
  })

  it('only aborts while running', () => {
    const { result } = renderAgent()

    act(() => {
      result.current.stop()
    })
    expect(result.current.status).toBe('not-started')
    expect(stopGeneration).not.toHaveBeenCalled()

    act(() => {
      void result.current.start('prompt')
    })
    act(() => {
      result.current.stop()
    })

    expect(result.current.status).toBe('aborted')
    expect(trackEvent).toHaveBeenCalledWith(trackingEvents.aborted)
    expect(stopGeneration).toHaveBeenCalledOnce()
  })

  it('resets back to not-started', () => {
    const { result } = renderAgent()

    act(() => {
      void result.current.start('prompt')
    })
    act(() => {
      result.current.reset()
    })

    expect(result.current.status).toBe('not-started')
  })
})
