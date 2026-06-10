import { StaticToolCall } from 'ai'
import { useEffect, useRef } from 'react'

import { UsageEventName } from '@/services/usageTracking/types'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { Threshold } from '@/types/testOptions'
import {
  getRequestDetails,
  getRequestsMetadata,
  searchRequests,
} from '@/utils/assistant/searchToolHandlers'
import { useAssistantAgent } from '@/utils/assistant/useAssistantAgent'
import { exhaustive } from '@/utils/typescript'

import { useSetupWizard } from '../../state/SetupWizardContext'

import {
  suggestThresholdsInputSchema,
  systemPrompt,
  thresholdsTools,
} from './constants'
import { computeResponseTimeStats } from './responseTimeStats'

type ThresholdsToolCall = StaticToolCall<typeof thresholdsTools>

interface ThresholdProposal {
  threshold: Threshold
  rationale: string
}

export function useThresholdsAgent() {
  const { dispatch } = useSetupWizard()
  const requests = useGeneratorStore(selectFilteredRequests)

  const proposalsRef = useRef<ThresholdProposal[]>([])

  const agent = useAssistantAgent({
    tools: thresholdsTools,
    trackingEvents: {
      started: { event: UsageEventName.ThresholdSuggestionStarted },
      errored: { event: UsageEventName.ThresholdSuggestionErrored },
      aborted: { event: UsageEventName.ThresholdSuggestionAborted },
    },
    onToolCall: handleToolCall,
  })

  const { actionsLog, status } = agent

  function handleToolCall(toolCall: ThresholdsToolCall) {
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

      case 'suggestThresholds': {
        const { thresholds } = suggestThresholdsInputSchema.parse(
          toolCall.input
        )
        proposalsRef.current = thresholds.map((suggestion) => ({
          threshold: {
            id: crypto.randomUUID(),
            metric: suggestion.metric,
            statistic: suggestion.statistic,
            condition: suggestion.condition,
            value: suggestion.value,
            stopTest: suggestion.stopTest,
          },
          rationale: suggestion.rationale,
        }))
        actionsLog.addEntry({
          type: 'found',
          text: `Suggested **${thresholds.length} thresholds**`,
        })
        return { acceptedThresholds: thresholds.length }
      }

      case 'finish': {
        const isSuccess =
          toolCall.input.outcome === 'success' &&
          proposalsRef.current.length > 0

        window.studio.app.trackEvent({
          event: isSuccess
            ? UsageEventName.ThresholdSuggestionSucceeded
            : UsageEventName.ThresholdSuggestionFailed,
        })
        actionsLog.markLastReasoningAsOutcome(
          isSuccess ? 'outcome-success' : 'outcome-failure'
        )
        return toolCall.input.outcome
      }

      default:
        return exhaustive(toolCall)
    }
  }

  const dispatchCompletion = () => {
    const proposals = proposalsRef.current

    if (proposals.length === 0) {
      dispatch({
        type: 'stepRunFailed',
        stepId: 'thresholds',
        message: 'The Assistant did not suggest any thresholds.',
      })
      return
    }

    const { thresholds, setThresholds } = useGeneratorStore.getState()

    setThresholds([
      ...thresholds,
      ...proposals.map((proposal) => proposal.threshold),
    ])
    dispatch({
      type: 'stepRunCompleted',
      stepId: 'thresholds',
      result: {
        step: 'thresholds',
        rationaleById: Object.fromEntries(
          proposals.map((proposal) => [
            proposal.threshold.id,
            proposal.rationale,
          ])
        ),
      },
      log: actionsLog.entries,
      summary: `Suggested ${proposals.length} threshold${proposals.length === 1 ? '' : 's'} tuned to the observed latency`,
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
        stepId: 'thresholds',
        message: 'The Assistant run failed. Try again.',
      })
    }

    if (status === 'aborted') {
      dispatch({ type: 'stepRunAborted', stepId: 'thresholds' })
    }
    // Only react to status transitions; the completion payload is read from refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  function start() {
    proposalsRef.current = []
    const stats = computeResponseTimeStats(requests)

    dispatch({ type: 'stepRunStarted', stepId: 'thresholds' })
    actionsLog.addEntry({
      type: 'info',
      text: `Analyzing response times across **${stats.requestCount} requests**`,
    })

    void agent.start(
      `${systemPrompt}\n\nObserved statistics:\n${JSON.stringify(stats)}`
    )
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
