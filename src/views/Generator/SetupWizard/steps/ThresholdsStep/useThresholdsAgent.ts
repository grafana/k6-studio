import { StaticToolCall } from 'ai'
import { useRef } from 'react'

import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { Threshold } from '@/types/testOptions'
import {
  handleRecordingSearchToolCall,
  isRecordingSearchToolCall,
} from '@/utils/assistant/handleRecordingSearchToolCall'
import { exhaustive } from '@/utils/typescript'

import { useSetupWizard, useStepState } from '../../state/SetupWizardContext'
import { useStepAgent } from '../useStepAgent'
import { withdrawStepArtifacts } from '../withdrawStepArtifacts'

import {
  finishInputSchema,
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
  const finishOutcomeRef = useRef<'success' | 'partial-success' | 'failure'>(
    'success'
  )

  const agent = useStepAgent({
    stepId: 'thresholds',
    tools: thresholdsTools,
    onToolCall: handleToolCall,
    onCompleted: dispatchCompletion,
    beginRun: (run) => {
      proposalsRef.current = []
      finishOutcomeRef.current = 'success'
      const stats = computeResponseTimeStats(requests)

      void run.start(
        `${systemPrompt}\n\nObserved statistics:\n${JSON.stringify(stats)}${buildExistingThresholdsContext()}`
      )
      run.actionsLog.addEntry({
        type: 'info',
        text: `Analyzing response times across **${stats.requestCount} requests**`,
      })
    },
    cleanup: cleanupCommittedThresholds,
    skip: () => ({
      result: {
        step: 'thresholds',
        rationaleById: {},
        preexistingIds: useGeneratorStore
          .getState()
          .thresholds.map((threshold) => threshold.id),
      },
      summary: 'Step skipped, no thresholds suggested',
    }),
  })

  // On older generators the test may already define thresholds; without this
  // the agent happily suggests duplicates of them.
  function buildExistingThresholdsContext() {
    const existing = useGeneratorStore.getState().thresholds

    if (existing.length === 0) {
      return ''
    }

    const summary = existing.map(
      ({ metric, statistic, condition, value }) =>
        `${metric} ${statistic} ${condition} ${value}`
    )
    return `\n\nThe test already defines these thresholds. Do not duplicate them; only suggest complementary ones:\n${JSON.stringify(summary)}`
  }

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
        // Tool input arrives unvalidated; re-parse so an off-enum outcome is
        // returned to the model as a retryable error instead of committing.
        const { outcome } = finishInputSchema.parse(toolCall.input)
        const isSuccess =
          outcome === 'success' && proposalsRef.current.length > 0

        agent.actionsLog.markLastReasoningAsOutcome(
          isSuccess ? 'outcome-success' : 'outcome-failure'
        )
        finishOutcomeRef.current = outcome
        return outcome
      }

      default:
        return exhaustive(toolCall)
    }
  }

  function dispatchCompletion() {
    const proposals = proposalsRef.current

    // An explicit failure outcome means the analysis was not usable; discard
    // any proposals made along the way instead of committing them.
    if (finishOutcomeRef.current === 'failure') {
      agent.trackFinished('failure')
      dispatch({
        type: 'stepRunFailed',
        stepId: 'thresholds',
        message:
          'The Assistant could not suggest thresholds for this recording.',
      })
      return
    }

    if (proposals.length === 0) {
      agent.trackFinished('failure')
      dispatch({
        type: 'stepRunFailed',
        stepId: 'thresholds',
        message: 'The Assistant did not suggest any thresholds.',
      })
      return
    }

    agent.trackFinished(finishOutcomeRef.current)

    const { thresholds, setThresholds, setWizardUsed } =
      useGeneratorStore.getState()

    // The wizard configured the generator only when the run actually commits.
    setWizardUsed(true)
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
        // Snapshot taken before the commit above appended the suggestions.
        preexistingIds: thresholds.map((threshold) => threshold.id),
      },
      log: agent.actionsLog.entries,
      summary: `Suggested ${proposals.length} threshold${proposals.length === 1 ? '' : 's'} tuned to the observed latency`,
    })
  }

  // Re-running the step withdraws the previously committed thresholds.
  function cleanupCommittedThresholds() {
    withdrawStepArtifacts(stepState)
  }

  return agent
}
