import { StaticToolCall } from 'ai'
import { useRef } from 'react'

import { UsageEventName } from '@/services/usageTracking/types'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { Threshold } from '@/types/testOptions'
import {
  handleRecordingSearchToolCall,
  isRecordingSearchToolCall,
} from '@/utils/assistant/handleRecordingSearchToolCall'
import { useAssistantAgent } from '@/utils/assistant/useAssistantAgent'
import { exhaustive } from '@/utils/typescript'

import { useSetupWizard, useStepState } from '../../state/SetupWizardContext'
import { useStepAgentLifecycle } from '../useStepAgentLifecycle'

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
  const stepState = useStepState('thresholds')
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

  function handleToolCall(toolCall: ThresholdsToolCall): unknown {
    if (isRecordingSearchToolCall(toolCall)) {
      return handleRecordingSearchToolCall(
        toolCall,
        requests,
        actionsLog.addEntry
      )
    }

    switch (toolCall.toolName) {
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

  useStepAgentLifecycle({
    stepId: 'thresholds',
    status,
    onCompleted: dispatchCompletion,
    failureMessage: 'The Assistant run failed. Try again.',
  })

  function start() {
    proposalsRef.current = []
    const stats = computeResponseTimeStats(requests)

    dispatch({ type: 'stepRunStarted', stepId: 'thresholds' })
    // agent.start resets the log timer, so the entry goes in afterwards.
    void agent.start(
      `${systemPrompt}\n\nObserved statistics:\n${JSON.stringify(stats)}`
    )
    actionsLog.addEntry({
      type: 'info',
      text: `Analyzing response times across **${stats.requestCount} requests**`,
    })
  }

  // Re-running the step withdraws the previously committed thresholds.
  function cleanupCommittedThresholds() {
    if (
      stepState.status !== 'completed' ||
      stepState.result.step !== 'thresholds'
    ) {
      return
    }

    const committedIds = new Set(Object.keys(stepState.result.rationaleById))
    const { thresholds, setThresholds } = useGeneratorStore.getState()

    setThresholds(
      thresholds.filter((threshold) => !committedIds.has(threshold.id))
    )
  }

  function restart() {
    cleanupCommittedThresholds()
    agent.reset()
    start()
  }

  function skip() {
    agent.stop()
    window.studio.app.trackEvent({
      event: UsageEventName.TestSetupWizardStepSkipped,
      payload: { step: 'thresholds' },
    })
    dispatch({
      type: 'stepRunCompleted',
      stepId: 'thresholds',
      result: { step: 'thresholds', rationaleById: {} },
      log: actionsLog.entries,
      summary: 'Step skipped - no thresholds suggested',
    })
  }

  return {
    start,
    restart,
    skip,
    stop: agent.stop,
    status: agent.status,
    error: agent.error,
    logEntries: actionsLog.entries,
  }
}
