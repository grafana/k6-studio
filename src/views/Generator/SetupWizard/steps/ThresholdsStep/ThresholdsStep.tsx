import { Flex } from '@radix-ui/themes'

import { Thresholds } from '@/components/TestOptions/Thresholds/Thresholds'
import { useGeneratorStore } from '@/store/generator'
import { HTTP_METRICS_CONFIG } from '@/views/Generator/TestOptions/httpThresholdMetrics'

import { useStepState } from '../../state/SetupWizardContext'
import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'
import { AgentRunPanel } from '../AgentRunPanel'
import { CompletedStepSummary } from '../CompletedStepSummary'
import { useAutoStartAgent } from '../useAutoStartAgent'

import { useThresholdsAgent } from './useThresholdsAgent'

interface CompletedThresholdsStepProps {
  onRerun: () => void
}

function CompletedThresholdsStep({ onRerun }: CompletedThresholdsStepProps) {
  const stepState = useStepState('thresholds')
  const thresholds = useGeneratorStore((store) => store.thresholds)
  const setThresholds = useGeneratorStore((store) => store.setThresholds)
  const { goBack, goNext } = useWizardNavigation()

  if (
    stepState.status !== 'completed' ||
    stepState.result.step !== 'thresholds'
  ) {
    return null
  }

  const { rationaleById } = stepState.result

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
            value={thresholds}
            onChange={setThresholds}
            metricsConfig={HTTP_METRICS_CONFIG}
            getRowAnnotation={(id) => rationaleById[id]}
            hideRemove
          />
        </Flex>
      </StepFrame>
      <WizardFooter canContinue onBack={goBack} onContinue={goNext} />
    </>
  )
}

export function ThresholdsStep() {
  const stepState = useStepState('thresholds')
  const { goBack, goNext } = useWizardNavigation()
  const { start, restart, skip, stop, logEntries, status } =
    useThresholdsAgent()

  useAutoStartAgent(stepState.status, start, stop)

  const handleSkip = () => {
    skip()
    goNext()
  }

  if (stepState.status === 'completed') {
    return <CompletedThresholdsStep onRerun={restart} />
  }

  return (
    <AgentRunPanel
      stepId="thresholds"
      stepState={stepState}
      logEntries={logEntries}
      status={status}
      onRestart={restart}
      errorMessage="The Assistant could not suggest thresholds for this recording."
      runningLabel="Analyzing response times..."
      onBack={goBack}
      onContinue={goNext}
      onSkip={handleSkip}
    />
  )
}
