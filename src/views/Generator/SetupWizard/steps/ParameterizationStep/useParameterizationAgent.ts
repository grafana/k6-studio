import { StaticToolCall } from 'ai'
import { useRef } from 'react'

import { UsageEventName } from '@/services/usageTracking/types'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import {
  handleRecordingSearchToolCall,
  isRecordingSearchToolCall,
} from '@/utils/assistant/handleRecordingSearchToolCall'
import { exhaustive } from '@/utils/typescript'

import { useSetupWizard, useStepState } from '../../state/SetupWizardContext'
import { useStepAgent } from '../useStepAgent'

import {
  addParameterInputSchema,
  parameterizationTools,
  systemPrompt,
} from './constants'
import {
  aiParameterToRule,
  mergeVariables,
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
  const stepState = useStepState('parameterization')
  const requests = useGeneratorStore(selectFilteredRequests)

  const proposalsRef = useRef<ParameterizationProposal[]>([])
  const finishSucceededRef = useRef(false)

  const agent = useStepAgent({
    stepId: 'parameterization',
    tools: parameterizationTools,
    trackingEvents: {
      started: { event: UsageEventName.ParameterizationStarted },
      errored: { event: UsageEventName.ParameterizationErrored },
      aborted: { event: UsageEventName.ParameterizationAborted },
    },
    onToolCall: handleToolCall,
    onCompleted: dispatchCompletion,
    beginRun: (run) => {
      proposalsRef.current = []
      finishSucceededRef.current = false

      void run.start(systemPrompt)
      run.actionsLog.addEntry({
        type: 'info',
        text: 'Scanning request bodies and query strings',
      })
    },
    cleanup: cleanupCommittedProposals,
    skip: {
      result: {
        step: 'parameterization',
        suggestions: [],
        addedVariableNames: [],
      },
      summary: 'Step skipped - no values parameterized',
    },
  })

  function handleToolCall(toolCall: ParameterizationToolCall): unknown {
    if (isRecordingSearchToolCall(toolCall)) {
      return handleRecordingSearchToolCall(
        toolCall,
        requests,
        agent.actionsLog.addEntry
      )
    }

    switch (toolCall.toolName) {
      case 'addParameter': {
        const { parameter } = addParameterInputSchema.parse(toolCall.input)
        const proposal = aiParameterToRule(parameter)
        proposalsRef.current = [...proposalsRef.current, proposal]
        agent.actionsLog.addEntry({
          type: 'found',
          text: `Parameterizing **${parameter.field}** in \`${parameter.location.method} ${parameter.location.path}\``,
          ruleId: proposal.rule.id,
        })
        return { ruleId: proposal.rule.id }
      }

      case 'finish': {
        finishSucceededRef.current = toolCall.input.outcome !== 'failure'
        window.studio.app.trackEvent({
          event: outcomeEvents[toolCall.input.outcome],
        })
        agent.actionsLog.markLastReasoningAsOutcome(
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

  function dispatchCompletion() {
    if (!finishSucceededRef.current) {
      dispatch({
        type: 'stepRunFailed',
        stepId: 'parameterization',
        message:
          'The Assistant could not analyze parameterization for this recording.',
      })
      return
    }

    const proposals = proposalsRef.current
    const { rules, setRules, variables, setVariables } =
      useGeneratorStore.getState()

    const { variables: mergedVariables, addedNames } = mergeVariables(
      variables,
      proposals.map((proposal) => proposal.variable)
    )

    setRules([...rules, ...proposals.map((proposal) => proposal.rule)])
    setVariables(mergedVariables)
    dispatch({
      type: 'stepRunCompleted',
      stepId: 'parameterization',
      result: {
        step: 'parameterization',
        suggestions: proposals.map((proposal) => proposal.meta),
        addedVariableNames: addedNames,
      },
      log: agent.actionsLog.entries,
      summary:
        proposals.length === 0
          ? 'No values need parameterization'
          : `Suggested ${proposals.length} parameterization rule${proposals.length === 1 ? '' : 's'} - review the values below`,
    })
  }

  // Re-running the step withdraws the previously committed rules and the
  // variables this run introduced before starting a fresh analysis.
  function cleanupCommittedProposals() {
    if (
      stepState.status !== 'completed' ||
      stepState.result.step !== 'parameterization'
    ) {
      return
    }

    const ruleIds = new Set(
      stepState.result.suggestions.map((suggestion) => suggestion.ruleId)
    )
    // Only delete variables this run created. A proposal that reused a
    // pre-existing variable name is absent from addedVariableNames, so the
    // user's pre-existing variable survives the re-run.
    const removedVariableNames = new Set(stepState.result.addedVariableNames)
    const { rules, setRules, variables, setVariables } =
      useGeneratorStore.getState()

    setRules(rules.filter((rule) => !ruleIds.has(rule.id)))
    setVariables(
      variables.filter((variable) => !removedVariableNames.has(variable.name))
    )
  }

  return agent
}
