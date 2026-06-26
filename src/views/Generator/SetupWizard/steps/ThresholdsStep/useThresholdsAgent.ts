import { StaticToolCall } from 'ai'
import { useRef } from 'react'

import { UsageEventName } from '@/services/usageTracking/types'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { Threshold } from '@/types/testOptions'
import {
  handleRecordingSearchToolCall,
  isRecordingSearchToolCall,
} from '@/utils/assistant/handleRecordingSearchToolCall'
import { exhaustive } from '@/utils/typescript'

import { useSetupWizard, useStepState } from '../../state/SetupWizardContext'
import { useStepAgent } from '../useStepAgent'

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
  const finishSucceededRef = useRef(false)

  const agent = useStepAgent({
    stepId: 'thresholds',
    tools: thresholdsTools,
    trackingEvents: {
      started: { event: UsageEventName.ThresholdSuggestionStarted },
      errored: { event: UsageEventName.ThresholdSuggestionErrored },
      aborted: { event: UsageEventName.ThresholdSuggestionAborted },
    },
    onToolCall: handleToolCall,
    onCompleted: dispatchCompletion,
    beginRun: (run) => {
      proposalsRef.current = []
      finishSucceededRef.current = false
      const stats = computeResponseTimeStats(requests)

      void run.start(
        `${systemPrompt}\n\nObserved statistics:\n${JSON.stringify(stats)}`
      )
      run.actionsLog.addEntry({
        type: 'info',
        text: `Analyzing response times across **${stats.requestCount} requests**`,
      })
    },
    cleanup: cleanupCommittedThresholds,
    skip: {
      result: { step: 'thresholds', rationaleById: {} },
      summary: 'Step skipped - no thresholds suggested',
    },
  })

  function handleToolCall(toolCall: ThresholdsToolCall): unknown {
    if (isRecordingSearchToolCall(toolCall)) {
      return handleRecordingSearchToolCall(
        toolCall,
        requests,
        agent.actionsLog.addEntry
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
            enabled: true,
          },
          rationale: suggestion.rationale,
        }))
        agent.actionsLog.addEntry({
          type: 'found',
          text: `Suggested **${thresholds.length} thresholds**`,
        })
        return { acceptedThresholds: thresholds.length }
      }

      case 'finish': {
        const isSuccess =
          toolCall.input.outcome === 'success' &&
          proposalsRef.current.length > 0
        finishSucceededRef.current = isSuccess

        window.studio.app.trackEvent({
          event: isSuccess
            ? UsageEventName.ThresholdSuggestionSucceeded
            : UsageEventName.ThresholdSuggestionFailed,
        })
        agent.actionsLog.markLastReasoningAsOutcome(
          isSuccess ? 'outcome-success' : 'outcome-failure'
        )
        return toolCall.input.outcome
      }

      default:
        return exhaustive(toolCall)
    }
  }

  function dispatchCompletion() {
    const proposals = proposalsRef.current

    if (!finishSucceededRef.current) {
      dispatch({
        type: 'stepRunFailed',
        stepId: 'thresholds',
        message:
          proposals.length === 0
            ? 'The Assistant did not suggest any thresholds.'
            : 'The Assistant could not recommend thresholds for this recording.',
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
      log: agent.actionsLog.entries,
      summary: `Suggested ${proposals.length} threshold${proposals.length === 1 ? '' : 's'} tuned to the observed latency`,
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

  return agent
}
