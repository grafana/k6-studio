import { Flex, Text } from '@radix-ui/themes'
import { useCallback, useMemo } from 'react'

import { Thresholds } from '@/components/TestOptions/Thresholds/Thresholds'
import { useGeneratorStore } from '@/store/generator'
import { Threshold } from '@/types/testOptions'
import { HTTP_METRICS_CONFIG } from '@/views/Generator/TestOptions/httpThresholdMetrics'

import { useStepState } from '../../state/SetupWizardContext'
import { isStepDone } from '../../state/types'
import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'
import { AgentRunPanel } from '../AgentRunPanel'
import { CompletedStepSummary } from '../CompletedStepSummary'
import { useAutoStartAgent } from '../useAutoStartAgent'

import { mergeShownThresholds, partitionThresholds } from './stepThresholds'
import { useThresholdsAgent } from './useThresholdsAgent'

interface CompletedThresholdsStepProps {
  onRerun: () => void
}

function CompletedThresholdsStep({ onRerun }: CompletedThresholdsStepProps) {
  const stepState = useStepState('thresholds')
  const thresholds = useGeneratorStore((store) => store.thresholds)
  const setThresholds = useGeneratorStore((store) => store.setThresholds)
  const { goBack, goNext } = useWizardNavigation()

  const result =
    isStepDone(stepState) && stepState.result.step === 'thresholds'
      ? stepState.result
      : null
  const preexistingIds = result?.preexistingIds

  // The step owns only what it produced: suggestions plus rows added here.
  // Thresholds the generator already had stay hidden and untouched, like the
  // other steps treat pre-existing rules. Memoized so the stable reference
  // keeps the controlled form from re-checking its state on every render.
  const { shown, preexisting } = useMemo(
    () => partitionThresholds(thresholds, preexistingIds ?? []),
    [thresholds, preexistingIds]
  )

  const handleShownChange = useCallback(
    (nextShown: Threshold[]) => {
      setThresholds(
        mergeShownThresholds(thresholds, preexistingIds ?? [], nextShown)
      )
    },
    [setThresholds, thresholds, preexistingIds]
  )

  if (result === null || !isStepDone(stepState)) {
    return null
  }

  const { rationaleById } = result

  return (
    <>
      <StepFrame stepId="thresholds">
        <Flex direction="column" gap="3">
          <CompletedStepSummary
            summary={stepState.summary}
            log={stepState.log}
            onRerun={onRerun}
          />
          <Thresholds
            value={shown}
            onChange={handleShownChange}
            metricsConfig={HTTP_METRICS_CONFIG}
            getRowAnnotation={(id) => rationaleById[id]}
            // Suggested thresholds toggle so a rejection is visible (and
            // withdrawable on re-run); rows the user added are simply removed.
            getRowControl={(id) =>
              rationaleById[id] !== undefined ? 'toggle' : 'remove'
            }
          />
          {preexisting.length > 0 && (
            <Text size="1" color="gray">
              We keep the {preexisting.length} threshold
              {preexisting.length === 1 ? '' : 's'} this test already had. You
              can manage them in Test options.
            </Text>
          )}
        </Flex>
      </StepFrame>
      <WizardFooter canContinue onBack={goBack} onContinue={goNext} />
    </>
  )
}

export function ThresholdsStep() {
  const stepState = useStepState('thresholds')
  const { goBack, goNext } = useWizardNavigation()
  const { start, restart, skip, stop, actionsLog, status } =
    useThresholdsAgent()

  useAutoStartAgent(stepState.status, start, stop)

  const handleSkip = () => {
    skip()
    goNext()
  }

  if (isStepDone(stepState)) {
    return <CompletedThresholdsStep onRerun={restart} />
  }

  return (
    <AgentRunPanel
      stepId="thresholds"
      run={{
        state: stepState,
        status,
        logEntries: actionsLog.entries,
        errorMessage:
          'The Assistant could not suggest thresholds for this recording.',
        runningLabel: 'Analyzing response times...',
        onRestart: restart,
      }}
      nav={{ onBack: goBack, onContinue: goNext, onSkip: handleSkip }}
    />
  )
}
