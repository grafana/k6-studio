import { StaticToolCall } from 'ai'
import { useRef } from 'react'

import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import {
  handleRecordingSearchToolCall,
  isRecordingSearchToolCall,
} from '@/utils/assistant/handleRecordingSearchToolCall'
import { exhaustive } from '@/utils/typescript'

import { useSetupWizard, useStepState } from '../../state/SetupWizardContext'
import { useStepAgent } from '../useStepAgent'
import { withdrawStepArtifacts } from '../withdrawStepArtifacts'

import {
  addParameterInputSchema,
  finishInputSchema,
  parameterizationTools,
  systemPrompt,
} from './constants'
import {
  aiParameterToRule,
  mergeVariables,
  ParameterizationProposal,
} from './parameterization.utils'

type ParameterizationToolCall = StaticToolCall<typeof parameterizationTools>

export function useParameterizationAgent() {
  const { dispatch } = useSetupWizard()
  const stepState = useStepState('parameterization')
  const requests = useGeneratorStore(selectFilteredRequests)

  const proposalsRef = useRef<ParameterizationProposal[]>([])
  const finishOutcomeRef = useRef<'success' | 'partial-success' | 'failure'>(
    'success'
  )

  const agent = useStepAgent({
    stepId: 'parameterization',
    tools: parameterizationTools,
    onToolCall: handleToolCall,
    onCompleted: dispatchCompletion,
    beginRun: (run) => {
      proposalsRef.current = []
      finishOutcomeRef.current = 'success'

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
      summary: 'Step skipped, no values parameterized',
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
        // Tool input arrives unvalidated; re-parse so an off-enum outcome is
        // returned to the model as a retryable error instead of committing.
        const { outcome } = finishInputSchema.parse(toolCall.input)
        agent.actionsLog.markLastReasoningAsOutcome(
          outcome === 'failure'
            ? 'outcome-failure'
            : outcome === 'partial-success'
              ? 'outcome-partial'
              : 'outcome-success'
        )
        finishOutcomeRef.current = outcome
        return outcome
      }

      default:
        return exhaustive(toolCall)
    }
  }

  function dispatchCompletion() {
    // An explicit failure outcome means the analysis was not usable; discard
    // any proposals made along the way instead of committing them.
    if (finishOutcomeRef.current === 'failure') {
      agent.trackFinished('failure')
      dispatch({
        type: 'stepRunFailed',
        stepId: 'parameterization',
        message:
          'The Assistant could not analyze this recording for parameterization.',
      })
      return
    }

    agent.trackFinished(finishOutcomeRef.current)

    const proposals = proposalsRef.current
    const { rules, setRules, variables, setVariables, setWizardUsed } =
      useGeneratorStore.getState()

    // The wizard configured the generator only when the run actually commits.
    setWizardUsed(true)

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
          : `Suggested ${proposals.length} parameterization rule${proposals.length === 1 ? '' : 's'}`,
    })
  }

  // Re-running the step withdraws the previously committed rules and the
  // variables this run introduced before starting a fresh analysis.
  function cleanupCommittedProposals() {
    withdrawStepArtifacts(stepState)
  }

  return agent
}
