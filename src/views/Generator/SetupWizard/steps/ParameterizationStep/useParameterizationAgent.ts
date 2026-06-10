import { StaticToolCall } from 'ai'
import { useEffect, useRef } from 'react'

import { UsageEventName } from '@/services/usageTracking/types'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import {
  getRequestDetails,
  getRequestsMetadata,
  searchRequests,
} from '@/utils/assistant/searchToolHandlers'
import { useAssistantAgent } from '@/utils/assistant/useAssistantAgent'
import { exhaustive } from '@/utils/typescript'

import { useSetupWizard } from '../../state/SetupWizardContext'

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

  function handleToolCall(toolCall: ParameterizationToolCall) {
    switch (toolCall.toolName) {
      case 'searchRequests': {
        const { query, limit } = toolCall.input
        actionsLog.addEntry({
          type: 'info',
          text: `Searching requests for "${query}"`,
        })
        return searchRequests(requests, query, limit ?? 20)
      }

      case 'getRequestsMetadata': {
        const { startIndex, endIndex } = toolCall.input
        actionsLog.addEntry({ type: 'info', text: 'Reading request metadata' })
        return getRequestsMetadata(requests, startIndex ?? 0, endIndex)
      }

      case 'getRequestDetails': {
        const { requestIds, fields } = toolCall.input
        actionsLog.addEntry({
          type: 'info',
          text: `Inspecting ${requestIds.length} request${requestIds.length > 1 ? 's' : ''}`,
        })
        return getRequestDetails(requests, requestIds, fields)
      }

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

  useEffect(() => {
    if (status === 'completed') {
      dispatchCompletion()
      return
    }

    if (status === 'error') {
      dispatch({
        type: 'stepRunFailed',
        stepId: 'parameterization',
        message: 'The Assistant run failed. Try again.',
      })
    }

    if (status === 'aborted') {
      dispatch({ type: 'stepRunAborted', stepId: 'parameterization' })
    }
    // Only react to status transitions; the completion payload is read from refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  function start() {
    proposalsRef.current = []
    dispatch({ type: 'stepRunStarted', stepId: 'parameterization' })
    actionsLog.addEntry({
      type: 'info',
      text: 'Scanning request bodies and query strings',
    })

    void agent.start(systemPrompt)
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
