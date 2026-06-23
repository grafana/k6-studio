import { StaticToolCall, ToolSet } from 'ai'

import { UsageEvent, UsageEventName } from '@/services/usageTracking/types'
import { useAssistantAgent } from '@/utils/assistant/useAssistantAgent'

import { useSetupWizard } from '../state/SetupWizardContext'
import { StepId, StepResult } from '../state/types'

import { useStepAgentLifecycle } from './useStepAgentLifecycle'

const DEFAULT_FAILURE_MESSAGE = 'The Assistant run failed. Try again.'

type AgentControls<TTools extends ToolSet> = ReturnType<
  typeof useAssistantAgent<TTools>
>

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
   * Skips the step. A `{ result, summary }` uses the standard skip (stop the
   * agent, track the event, complete with an empty result); a function takes
   * over entirely for steps whose skip has side effects.
   */
  skip:
    | { result: StepResult; summary: string }
    | ((agent: AgentControls<TTools>) => void)
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
    if (typeof skip === 'function') {
      skip(agent)
      return
    }

    agent.stop()
    window.studio.app.trackEvent({
      event: UsageEventName.TestSetupWizardStepSkipped,
      payload: { step: stepId },
    })
    dispatch({
      type: 'stepRunCompleted',
      stepId,
      result: skip.result,
      log: agent.actionsLog.entries,
      summary: skip.summary,
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
