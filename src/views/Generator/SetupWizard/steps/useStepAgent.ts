import { StaticToolCall, ToolSet } from 'ai'

import { UsageEvent, UsageEventName } from '@/services/usageTracking/types'
import { useAssistantAgent } from '@/utils/assistant/useAssistantAgent'

import { useSetupWizard } from '../state/SetupWizardContext'
import { StepId, StepResult } from '../state/types'

import { useAbortStepOnUnmount } from './useAbortStepOnUnmount'
import { useStepAgentLifecycle } from './useStepAgentLifecycle'

const DEFAULT_FAILURE_MESSAGE = 'The Assistant run failed. Try again.'

type AgentControls<TTools extends ToolSet> = ReturnType<
  typeof useAssistantAgent<TTools>
>

interface StepSkip {
  result: StepResult
  summary: string
}

interface UseStepAgentConfig<TTools extends ToolSet> {
  stepId: StepId
  tools: TTools
  /** Tool whose call ends the run (default "finish"). */
  terminalTool?: keyof TTools & string
  trackingEvents: {
    started: UsageEvent
    errored: UsageEvent
    aborted: UsageEvent
  }
  failureMessage?: string
  onToolCall: (toolCall: StaticToolCall<TTools>) => unknown
  /** Reads run results from refs and dispatches the completion action. */
  onCompleted: () => void
  /** Builds the prompt and opening log entry, then starts the agent. */
  beginRun: (agent: AgentControls<TTools>) => void
  /** Withdraws previously committed output before a re-run. */
  cleanup?: () => void
  /**
   * The completion the step records when skipped. A function may run side
   * effects first (e.g. host selection) before returning it; either way the
   * shared skip path owns stopping the agent, tracking, and dispatching.
   */
  skip: StepSkip | ((agent: AgentControls<TTools>) => StepSkip)
}

/**
 * Shared scaffolding for the wizard's agent steps: wires the assistant agent to
 * the reducer lifecycle and provides the start/restart/skip controls and return
 * shape every step needs. Steps supply only what differs (tools, prompt,
 * tool-call handling, completion, cleanup, skip).
 */
export function useStepAgent<TTools extends ToolSet>({
  stepId,
  tools,
  terminalTool,
  trackingEvents,
  failureMessage = DEFAULT_FAILURE_MESSAGE,
  onToolCall,
  onCompleted,
  beginRun,
  cleanup,
  skip,
}: UseStepAgentConfig<TTools>) {
  const { dispatch } = useSetupWizard()
  const terminatedRef = useAbortStepOnUnmount(stepId)

  const agent = useAssistantAgent({
    tools,
    terminalTool,
    trackingEvents,
    onToolCall,
  })

  useStepAgentLifecycle({
    stepId,
    status: agent.status,
    onCompleted,
    failureMessage,
  })

  function start() {
    dispatch({ type: 'stepRunStarted', stepId })
    // agent.start resets the log timer, so the opening entry goes in afterwards.
    beginRun(agent)
  }

  function restart() {
    cleanup?.()
    agent.reset()
    start()
  }

  function runSkip() {
    // The step terminates itself here; suppress the unmount abort that follows
    // when the caller navigates away in the same handler.
    terminatedRef.current = true
    agent.stop()

    const { result, summary } = typeof skip === 'function' ? skip(agent) : skip

    window.studio.app.trackEvent({
      event: UsageEventName.TestSetupWizardStepSkipped,
      payload: { step: stepId },
    })
    dispatch({
      type: 'stepRunCompleted',
      stepId,
      result,
      log: agent.actionsLog.entries,
      summary,
    })
  }

  return {
    start,
    restart,
    skip: runSkip,
    stop: agent.stop,
    status: agent.status,
    error: agent.error,
    logEntries: agent.actionsLog.entries,
    actionsLog: agent.actionsLog,
  }
}
