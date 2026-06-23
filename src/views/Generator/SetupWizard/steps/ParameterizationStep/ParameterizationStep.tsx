import { Flex, Text } from '@radix-ui/themes'

import { SuggestionListPanel } from '@/components/SuggestionList/SuggestionListPanel'
import { useGeneratorStore } from '@/store/generator'
import { ParameterizationRule } from '@/types/rules'

import { useStepState } from '../../state/SetupWizardContext'
import { ParamSuggestionMeta } from '../../state/types'
import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'
import { AgentRunPanel } from '../AgentRunPanel'
import { CompletedStepSummary } from '../CompletedStepSummary'
import { useAutoStartAgent } from '../useAutoStartAgent'

import { ParamRow } from './ParamRow'
import { useParameterizationAgent } from './useParameterizationAgent'

interface ResolvedParam {
  meta: ParamSuggestionMeta
  rule: ParameterizationRule
}

function ParamCardList({
  suggestions,
}: {
  suggestions: ParamSuggestionMeta[]
}) {
  const rules = useGeneratorStore((store) => store.rules)

  const resolved = suggestions.flatMap<ResolvedParam>((meta) => {
    const rule = rules.find((candidate) => candidate.id === meta.ruleId)

    // Removed rules drop out of the list; the store is the source of truth.
    if (rule === undefined || rule.type !== 'parameterization') {
      return []
    }

    return [{ meta, rule }]
  })

  if (resolved.length === 0) {
    return (
      <Text size="2" color="gray">
        No parameterization values found. Continue to the next step.
      </Text>
    )
  }

  return (
    <SuggestionListPanel>
      {resolved.map(({ meta, rule }, index) => (
        <ParamRow
          key={meta.ruleId}
          meta={meta}
          rule={rule}
          isLast={index === resolved.length - 1}
        />
      ))}
    </SuggestionListPanel>
  )
}

function CompletedParameterizationStep({ onRerun }: { onRerun: () => void }) {
  const stepState = useStepState('parameterization')
  const { goBack, goNext } = useWizardNavigation()

  if (
    stepState.status !== 'completed' ||
    stepState.result.step !== 'parameterization'
  ) {
    return null
  }

  return (
    <>
      <StepFrame stepId="parameterization">
        <Flex direction="column" gap="3">
          <CompletedStepSummary
            summary={stepState.summary}
            log={stepState.log}
            onRerun={onRerun}
          />
          <ParamCardList suggestions={stepState.result.suggestions} />
        </Flex>
      </StepFrame>
      <WizardFooter canContinue onBack={goBack} onContinue={goNext} />
    </>
  )
}

export function ParameterizationStep() {
  const stepState = useStepState('parameterization')
  const { goBack, goNext } = useWizardNavigation()
  const { start, restart, skip, stop, logEntries, status } =
    useParameterizationAgent()

  useAutoStartAgent(stepState.status, start, stop)

  const handleSkip = () => {
    skip()
    goNext()
  }

  if (stepState.status === 'completed') {
    return <CompletedParameterizationStep onRerun={restart} />
  }

  return (
    <AgentRunPanel
      stepId="parameterization"
      run={{
        state: stepState,
        status,
        logEntries,
        errorMessage:
          'The Assistant could not analyze this recording for parameterization.',
        runningLabel: 'Finding values to parameterize...',
        onRestart: restart,
      }}
      nav={{ onBack: goBack, onContinue: goNext, onSkip: handleSkip }}
    />
  )
}
