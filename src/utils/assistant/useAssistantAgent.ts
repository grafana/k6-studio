import { useChat } from '@ai-sdk/react'
import {
  InferUITools,
  StaticToolCall,
  ToolSet,
  UIDataTypes,
  UIMessage,
} from 'ai'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useActionsLog } from '@/components/Assistant/useActionsLog'
import { UsageEvent } from '@/services/usageTracking/types'

import { createTerminalToolGuard } from './chat'
import { IPCChatTransport } from './IPCChatTransport'
import { serializeToolDefinitions } from './tools'

export type AgentMessage<TTools extends ToolSet> = UIMessage<
  never,
  UIDataTypes,
  InferUITools<TTools>
>

export type AgentRunStatus =
  | 'not-started'
  | 'running'
  | 'completed'
  | 'error'
  | 'aborted'

interface UseAssistantAgentOptions<TTools extends ToolSet> {
  tools: TTools
  /**
   * The tool whose call ends the run (default: "finish"). Single-shot agents
   * can make their result-submission tool terminal to save a model turn.
   */
  terminalTool?: keyof TTools & string
  /**
   * Executes a tool call client-side and returns its output (or a promise
   * of it). Calling the terminal tool marks the run as completed.
   */
  onToolCall: (toolCall: StaticToolCall<TTools>) => unknown
  trackingEvents: {
    started: UsageEvent
    errored: UsageEvent
    aborted: UsageEvent
  }
}

export function useAssistantAgent<TTools extends ToolSet>({
  tools,
  terminalTool = 'finish',
  onToolCall,
  trackingEvents,
}: UseAssistantAgentOptions<TTools>) {
  const [status, setStatus] = useState<AgentRunStatus>('not-started')

  const statusRef = useRef(status)
  const onToolCallRef = useRef(onToolCall)

  useEffect(() => {
    onToolCallRef.current = onToolCall
  })

  function setStatusAndRef(next: AgentRunStatus) {
    statusRef.current = next
    setStatus(next)
  }

  const transport = useMemo(
    () =>
      new IPCChatTransport<AgentMessage<TTools>>({
        tools: serializeToolDefinitions(tools),
      }),
    // The toolset is a static module-level definition per agent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const finishGuard = useMemo(
    () => createTerminalToolGuard(terminalTool),
    // The terminal tool is a static per-agent configuration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const actionsLog = useActionsLog()

  const {
    sendMessage,
    error,
    messages,
    addToolOutput,
    stop: stopGeneration,
    clearError,
    setMessages,
  } = useChat<AgentMessage<TTools>>({
    transport,
    sendAutomaticallyWhen: finishGuard.guard,
    onError: (chatError) => {
      setStatusAndRef('error')
      window.studio.app.trackEvent(trackingEvents.errored)
      console.error(chatError)
    },
    onToolCall: async ({ toolCall }) => {
      if (toolCall.dynamic) {
        return
      }

      // TS cannot relate useChat's tool-call type to StaticToolCall while
      // TTools is unresolved; the shapes are identical for concrete toolsets.
      const staticToolCall = {
        ...toolCall,
        type: 'tool-call' as const,
      } as StaticToolCall<TTools>

      // A handler failure (e.g. the model sent input that fails zod
      // validation) must still produce a tool output: throwing here would
      // leave the assistant waiting for a response forever. Returning the
      // error lets the model correct itself and retry.
      let output: unknown
      let didToolFail = false
      try {
        output = await onToolCallRef.current(staticToolCall)
      } catch (toolError) {
        console.error(toolError)
        didToolFail = true
        output = {
          error:
            toolError instanceof Error
              ? toolError.message
              : 'Tool execution failed',
        }
      }

      if (toolCall.toolName === terminalTool && !didToolFail) {
        setStatusAndRef('completed')
      }

      void addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: output as never,
      })
    },
  })

  const syncMessagesToLog = actionsLog.syncFromMessages

  useEffect(() => {
    syncMessagesToLog(messages, statusRef.current === 'running')
  }, [messages, syncMessagesToLog])

  function start(initialText: string) {
    window.studio.app.trackEvent(trackingEvents.started)
    actionsLog.startTimer()
    setStatusAndRef('running')
    clearError()

    return sendMessage({ text: initialText })
  }

  function stop() {
    if (statusRef.current !== 'running') {
      return
    }

    window.studio.app.trackEvent(trackingEvents.aborted)
    void stopGeneration()
    setStatusAndRef('aborted')
  }

  function reset() {
    setMessages([])
    clearError()
    setStatusAndRef('not-started')
    actionsLog.reset()
    finishGuard.reset()
  }

  return {
    start,
    stop,
    reset,
    status,
    error,
    actionsLog,
  }
}
