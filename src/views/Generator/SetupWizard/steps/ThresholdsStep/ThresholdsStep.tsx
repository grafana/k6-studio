import { Box, Button, Callout, Flex, Text } from '@radix-ui/themes'
import { AlertTriangleIcon, CheckIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { ActionsLog } from '@/components/Assistant/ActionsLog'
import { Thresholds } from '@/components/TestOptions/Thresholds/Thresholds'
import { useGeneratorStore } from '@/store/generator'
import { HTTP_METRICS_CONFIG } from '@/views/Generator/TestOptions/httpThresholdMetrics'

import { useStepState } from '../../state/SetupWizardContext'
import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'

import { useThresholdsAgent } from './useThresholdsAgent'

interface ThresholdsStepProps {
  onComplete: () => void
}

function CompletedThresholdsStep({ onComplete }: ThresholdsStepProps) {
  const stepState = useStepState('thresholds')
  const thresholds = useGeneratorStore((store) => store.thresholds)
  const setThresholds = useGeneratorStore((store) => store.setThresholds)
  const { goBack } = useWizardNavigation()

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
          <Callout.Root color="green">
            <Callout.Icon>
              <CheckIcon size={16} />
            </Callout.Icon>
            <Callout.Text>{stepState.summary}</Callout.Text>
          </Callout.Root>
          <Thresholds
            value={thresholds}
            onChange={setThresholds}
            metricsConfig={HTTP_METRICS_CONFIG}
            getRowAnnotation={(id) => rationaleById[id]}
          />
        </Flex>
      </StepFrame>
      <WizardFooter
        isLastStep
        canContinue
        onBack={goBack}
        onContinue={onComplete}
      />
    </>
  )
}

export function ThresholdsStep({ onComplete }: ThresholdsStepProps) {
  const stepState = useStepState('thresholds')
  const { goBack } = useWizardNavigation()
  const { start, restart, stop, logEntries, status } = useThresholdsAgent()

  const hasAutoStarted = useRef(false)

  useEffect(() => {
    if (hasAutoStarted.current || stepState.status !== 'not-started') {
      return
    }

    hasAutoStarted.current = true
    start()
    // The ref guard makes this a mount-only auto-start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepState.status])

  useEffect(() => {
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (stepState.status === 'completed') {
    return <CompletedThresholdsStep onComplete={onComplete} />
  }

  return (
    <>
      <StepFrame stepId="thresholds">
        <Flex direction="column" gap="3" flexGrow="1" css={{ minHeight: 0 }}>
          {(stepState.status === 'error' || stepState.status === 'aborted') && (
            <>
              <Callout.Root color="amber">
                <Callout.Icon>
                  <AlertTriangleIcon size={16} />
                </Callout.Icon>
                <Callout.Text>
                  {stepState.status === 'error'
                    ? 'The Assistant could not suggest thresholds for this recording.'
                    : 'The analysis was stopped.'}
                </Callout.Text>
              </Callout.Root>
              <Flex>
                <Button variant="outline" color="gray" onClick={restart}>
                  Run analysis again
                </Button>
              </Flex>
            </>
          )}
          <Box
            css={{
              border: '1px solid var(--gray-4)',
              borderRadius: 'var(--radius-3)',
              minHeight: 200,
              flexGrow: 1,
            }}
          >
            <ActionsLog entries={logEntries} />
          </Box>
        </Flex>
      </StepFrame>
      <WizardFooter
        isLastStep
        canContinue={false}
        onBack={goBack}
        onContinue={onComplete}
      >
        {status === 'running' && (
          <Text size="1" color="gray">
            Analyzing response times...
          </Text>
        )}
      </WizardFooter>
    </>
  )
}
