import { StaticToolCall } from 'ai'
import { useRef } from 'react'

import { UsageEventName } from '@/services/usageTracking/types'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import {
  handleRecordingSearchToolCall,
  isRecordingSearchToolCall,
} from '@/utils/assistant/handleRecordingSearchToolCall'
import { useAssistantAgent } from '@/utils/assistant/useAssistantAgent'
import { exhaustive } from '@/utils/typescript'

import { useSetupWizard } from '../../state/SetupWizardContext'
import { useStepAgentLifecycle } from '../useStepAgentLifecycle'

import {
  addParameterInputSchema,
  parameterizationTools,
  systemPrompt,
} from './constants'
import {
  aiParameterToRule,
  ParameterizationProposal,
} from './parameterization.utils'

type ParameterizationToolCall = StaticToolCall<typeof parameterizationTools>

const outcomeEvents = {
  success: UsageEventName.ParameterizationSucceeded,
  'partial-success': UsageEventName.ParameterizationPartiallySucceeded,
  failure: UsageEventName.ParameterizationFailed,
} as const

export function useParameterizationAgent() {
  const { dispatch } = useSetupWizard()
  const requests = useGeneratorStore(selectFilteredRequests)

  const proposalsRef = useRef<ParameterizationProposal[]>([])

  const agent = useAssistantAgent({
    tools: parameterizationTools,
    trackingEvents: {
      started: { event: UsageEventName.ParameterizationStarted },
      errored: { event: UsageEventName.ParameterizationErrored },
      aborted: { event: UsageEventName.ParameterizationAborted },
    },
    onToolCall: handleToolCall,
  })

  const { actionsLog, status } = agent

  function handleToolCall(toolCall: ParameterizationToolCall): unknown {
    if (isRecordingSearchToolCall(toolCall)) {
      return handleRecordingSearchToolCall(
        toolCall,
        requests,
        actionsLog.addEntry
      )
    }

    switch (toolCall.toolName) {
      case 'addParameter': {
        const { parameter } = addParameterInputSchema.parse(toolCall.input)
        const proposal = aiParameterToRule(parameter)
        proposalsRef.current = [...proposalsRef.current, proposal]
        actionsLog.addEntry({
          type: 'found',
          text: `Parameterizing **${parameter.field}** in \`${parameter.location.method} ${parameter.location.path}\``,
          ruleId: proposal.rule.id,
        })
        return { ruleId: proposal.rule.id }
      }

      case 'finish': {
        window.studio.app.trackEvent({
          event: outcomeEvents[toolCall.input.outcome],
        })
        actionsLog.markLastReasoningAsOutcome(
          toolCall.input.outcome === 'failure'
            ? 'outcome-failure'
            : toolCall.input.outcome === 'partial-success'
              ? 'outcome-partial'
              : 'outcome-success'
        )
        return toolCall.input.outcome
      }

      default:
        return exhaustive(toolCall)
    }
  }

  const dispatchCompletion = () => {
    const proposals = proposalsRef.current
    const { rules, setRules } = useGeneratorStore.getState()

    setRules([...rules, ...proposals.map((proposal) => proposal.rule)])
    dispatch({
      type: 'stepRunCompleted',
      stepId: 'parameterization',
      result: {
        step: 'parameterization',
        suggestions: proposals.map((proposal) => proposal.meta),
      },
      log: actionsLog.entries,
      summary:
        proposals.length === 0
          ? 'No values need parameterization'
          : `Suggested ${proposals.length} parameterization rule${proposals.length === 1 ? '' : 's'} - review the values below`,
    })
  }

  useStepAgentLifecycle({
    stepId: 'parameterization',
    status,
    onCompleted: dispatchCompletion,
    failureMessage: 'The Assistant run failed. Try again.',
  })

  function start() {
    proposalsRef.current = []
    dispatch({ type: 'stepRunStarted', stepId: 'parameterization' })
    // agent.start resets the log timer, so the entry goes in afterwards.
    void agent.start(systemPrompt)
    actionsLog.addEntry({
      type: 'info',
      text: 'Scanning request bodies and query strings',
    })
  }

  function restart() {
    agent.reset()
    start()
  }

  return {
    start,
    restart,
    stop: agent.stop,
    status: agent.status,
    error: agent.error,
    logEntries: actionsLog.entries,
  }
}
